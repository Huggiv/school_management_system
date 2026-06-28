import { AdmissionPage } from "@/features/admissions/AdmissionPage";
import { AdmissionOpsLayout } from "@/features/admissions/components/AdmissionOpsLayout";
import { useAuth } from "@/features/auth/AuthProvider";

export function NewAdmissionPage() {
  const { user } = useAuth();
  const isAdminOpsUser = user?.role === "administrator" || user?.role === "principal";

  if (!isAdminOpsUser) {
    return <AdmissionPage />;
  }

  return (
    <AdmissionOpsLayout>
      <AdmissionPage />
    </AdmissionOpsLayout>
  );
}
