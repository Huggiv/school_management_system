import { AdmissionApplicationForm } from "@/features/admissions/components/AdmissionApplicationForm";
import { AdmissionOpsLayout } from "@/features/admissions/components/AdmissionOpsLayout";
import { useAuth } from "@/features/auth/AuthProvider";

export function NewAdmissionPage() {
  const { user } = useAuth();
  const isAdminOpsUser = user?.role === "administrator" || user?.role === "principal";
  const formSection = (
    <section className="panel">
      <h1>New Admission</h1>
      <AdmissionApplicationForm />
    </section>
  );

  if (!isAdminOpsUser) {
    return <main className="container page-stack">{formSection}</main>;
  }

  return <AdmissionOpsLayout>{formSection}</AdmissionOpsLayout>;
}
