import type { AdminLead, AdminLeadListResponse } from "@/lib/admin/types";
import { hasValidAdminSession } from "@/lib/auth/admin-session-server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { adminLeadQuerySchema } from "@/lib/validations/admin";

const unauthorizedResponse = () =>
  Response.json({ success: false, message: "No autorizado" }, { status: 401 });

const serverErrorResponse = () =>
  Response.json(
    { success: false, message: "No pudimos consultar los leads" },
    { status: 500 },
  );

export const GET = async (request: Request) => {
  if (!(await hasValidAdminSession())) {
    return unauthorizedResponse();
  }

  const url = new URL(request.url);
  const queryResult = adminLeadQuerySchema.safeParse({
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
  });

  if (!queryResult.success) {
    return Response.json(
      { success: false, message: "Parámetros de paginación no válidos" },
      { status: 400 },
    );
  }

  const { page, pageSize } = queryResult.data;
  const rangeStart = (page - 1) * pageSize;
  const rangeEnd = rangeStart + pageSize - 1;

  try {
    const { data, error, count } = await createSupabaseAdmin()
      .from("leads")
      .select(
        "id, project_type, estimated_budget, contact_name, email, phone, message, notification_status, notification_attempts, notified_at, created_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(rangeStart, rangeEnd);

    if (error) {
      console.error("[api/admin/leads] Supabase query failed", { code: error.code });
      return serverErrorResponse();
    }

    const total = count ?? 0;
    const response: AdminLeadListResponse = {
      leads: (data ?? []) as AdminLead[],
      page,
      pageSize,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
    };

    return Response.json(response, { status: 200 });
  } catch {
    console.error("[api/admin/leads] Supabase query failed", { code: "UNKNOWN" });
    return serverErrorResponse();
  }
};
