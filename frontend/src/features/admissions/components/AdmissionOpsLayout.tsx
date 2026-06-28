import { Outlet } from "react-router-dom";
import type { ReactNode } from "react";

import { AdmissionSideNav } from "@/features/admissions/components/AdmissionSideNav";

interface AdmissionOpsLayoutProps {
  children?: ReactNode;
}

export function AdmissionOpsLayout({ children }: AdmissionOpsLayoutProps) {
  return (
    <main className="container admission-ops-layout">
      <AdmissionSideNav />
      <section className="admission-ops-content">
        {children ?? <Outlet />}
      </section>
    </main>
  );
}
