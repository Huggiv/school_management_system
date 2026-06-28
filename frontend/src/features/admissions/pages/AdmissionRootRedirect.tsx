import { Navigate } from "react-router-dom";

import { useAuth } from "@/features/auth/AuthProvider";

export function AdmissionRootRedirect() {
  const { user } = useAuth();

  if (user?.role === "administrator" || user?.role === "principal") {
    return <Navigate to="/admission/manage" replace />;
  }

  return <Navigate to="/admission/new" replace />;
}
