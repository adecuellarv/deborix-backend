import { redirect } from "next/navigation";
import { LeadDashboard } from "@/components/admin/LeadDashboard";
import { hasValidAdminSession } from "@/lib/auth/admin-session-server";

const AdminLeadsPage = async () => {
  if (!(await hasValidAdminSession())) {
    redirect("/admin/login");
  }

  return <LeadDashboard />;
};

export default AdminLeadsPage;
