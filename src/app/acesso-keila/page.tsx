import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminEntryPage() {
  if (await isAdminAuthenticated()) {
    redirect("/acesso-keila/painel");
  }

  return <AdminLoginForm />;
}
