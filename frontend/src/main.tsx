import React from "react";
import ReactDOM from "react-dom/client";

import { AppRouter } from "@/router";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { QueryProvider } from "@/lib/query/QueryProvider";
import "@/styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </QueryProvider>
  </React.StrictMode>,
);
