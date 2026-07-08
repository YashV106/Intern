import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function ProtectedAdminRoute({ children }) {
  const router = useRouter();
  const [status, setStatus] = useState("loading"); // loading | ok | unauthorized | redirect

  useEffect(() => {
    // Runs only in the browser
    const isAdmin = window.localStorage.getItem("isAdmin") === "true";

    if (!isAdmin) {
      // If user is already logged in via Firebase, show 403
      // Otherwise redirect to /login
      const token = window.localStorage.getItem("token"); // used by /login flow
      const hasFirebaseSession =
        typeof window !== "undefined" && !!token;

      if (hasFirebaseSession) {
        setStatus("unauthorized");
      } else {
        setStatus("redirect");
      }

      return;
    }

    setStatus("ok");
  }, []);

  useEffect(() => {
    if (status === "redirect") router.replace("/login");
    if (status === "unauthorized") router.replace("/403");
  }, [router, status]);

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      </div>
    );
  }

  if (status !== "ok") return null;

  return <>{children}</>;
}
