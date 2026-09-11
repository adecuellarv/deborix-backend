import { leadSchema } from "@/lib/validations/lead";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

type ValidationErrors = Record<string, string[] | undefined>;

const invalidRequestResponse = (errors: ValidationErrors) =>
  Response.json(
    {
      success: false,
      message: "Los datos enviados no son válidos",
      errors,
    },
    { status: 400 },
  );

const databaseErrorResponse = () =>
  Response.json(
    {
      success: false,
      message: "No pudimos guardar la información. Intenta nuevamente.",
    },
    { status: 500 },
  );

const logDatabaseErrorCode = (operation: "insert" | "duplicate_lookup", code?: string) => {
  console.error("[api/leads] Supabase operation failed", {
    operation,
    code: code || "UNKNOWN",
  });
};

export const POST = async (request: Request) => {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return invalidRequestResponse({
      body: ["El cuerpo de la solicitud debe contener JSON válido"],
    });
  }

  const validationResult = leadSchema.safeParse(body);

  if (!validationResult.success) {
    return invalidRequestResponse(validationResult.error.flatten().fieldErrors);
  }

  const lead = validationResult.data;

  try {
    const supabase = createSupabaseAdmin();
    const { data: createdLead, error: insertError } = await supabase
      .from("leads")
      .insert({
        project_type: lead.projectType,
        estimated_budget: lead.estimatedBudget,
        contact_name: lead.contactName,
        email: lead.email,
        phone: lead.phone,
        message: lead.message,
        idempotency_key: lead.idempotencyKey,
      })
      .select("id")
      .single();

    if (!insertError && createdLead) {
      return Response.json(
        {
          success: true,
          message: "Lead recibido correctamente",
          leadId: createdLead.id,
          duplicate: false,
        },
        { status: 201 },
      );
    }

    if (insertError?.code !== "23505") {
      logDatabaseErrorCode("insert", insertError?.code);
      return databaseErrorResponse();
    }

    const { data: existingLead, error: lookupError } = await supabase
      .from("leads")
      .select("id")
      .eq("idempotency_key", lead.idempotencyKey)
      .maybeSingle();

    if (lookupError || !existingLead) {
      logDatabaseErrorCode("duplicate_lookup", lookupError?.code);
      return databaseErrorResponse();
    }

    return Response.json(
      {
        success: true,
        message: "La información ya había sido recibida",
        leadId: existingLead.id,
        duplicate: true,
      },
      { status: 200 },
    );
  } catch {
    logDatabaseErrorCode("insert");
    return databaseErrorResponse();
  }
};
