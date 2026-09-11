import type { LeadDashboardStats } from "@/lib/admin/types";
import { hasValidAdminSession } from "@/lib/auth/admin-session-server";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { leadDashboardStatsSchema } from "@/lib/validations/admin";

const unauthorizedResponse = () =>
  Response.json({ success: false, message: "No autorizado" }, { status: 401 });

const serverErrorResponse = () =>
  Response.json(
    { success: false, message: "No pudimos consultar las estadísticas" },
    { status: 500 },
  );

export const GET = async () => {
  if (!(await hasValidAdminSession())) {
    return unauthorizedResponse();
  }

  try {
    const { data, error } = await createSupabaseAdmin().rpc("get_lead_dashboard_stats");

    if (error) {
      console.error("[api/admin/leads/stats] Supabase query failed", { code: error.code });
      return serverErrorResponse();
    }

    const parsedStats = leadDashboardStatsSchema.safeParse(data);

    if (!parsedStats.success) {
      console.error("[api/admin/leads/stats] Unexpected aggregate shape");
      return serverErrorResponse();
    }

    const response: LeadDashboardStats = parsedStats.data;

    return Response.json(response, { status: 200 });
  } catch {
    console.error("[api/admin/leads/stats] Supabase query failed", { code: "UNKNOWN" });
    return serverErrorResponse();
  }
};
