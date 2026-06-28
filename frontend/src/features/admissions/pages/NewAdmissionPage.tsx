import { AdmissionApplicationForm } from "@/features/admissions/components/AdmissionApplicationForm";

export function NewAdmissionPage() {
  return (
    <main className="container page-stack">
      <section className="panel">
        <h1>New Admission</h1>
        <AdmissionApplicationForm />
      </section>
    </main>
  );
}
