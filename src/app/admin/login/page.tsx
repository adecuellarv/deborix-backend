import Image from "next/image";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { hasValidAdminSession } from "@/lib/auth/admin-session-server";

const AdminLoginPage = async () => {
  if (await hasValidAdminSession()) {
    redirect("/admin/leads");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Image alt="DEBORIX" className="mx-auto h-auto w-44" height={122} src="/logo.png" width={358} />
        <div className="mb-7 mt-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">Acceso administrativo</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600">Inicia sesión para consultar los leads recibidos.</p>
        </div>
        <AdminLoginForm />
      </div>
    </main>
  );
};

export default AdminLoginPage;
