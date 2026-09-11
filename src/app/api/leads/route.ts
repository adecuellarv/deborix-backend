import { leadSchema } from "@/lib/validations/lead";

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

  return Response.json(
    {
      success: true,
      message: "Lead recibido correctamente",
      leadId: crypto.randomUUID(),
    },
    { status: 201 },
  );
};
