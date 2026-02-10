"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for token in URL first (for shared links), then localStorage
    const urlToken = searchParams.get("token");
    const localToken = localStorage.getItem("token");
    const token = urlToken || localToken;

    if (!token) {
      router.replace("/");
      setLoading(false);
      return; // ← stop here
    }

    // quick local decode
    try {
      const { exp } = JSON.parse(atob(token.split(".")[1]));
      if (Date.now() >= exp * 1000) throw new Error("Expired");
      setVerified(true);
    } catch {
      // Only remove if it was from local storage
      if (!urlToken) {
        localStorage.removeItem("token");
      }
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router, searchParams]);

  if (loading) return <p>Loading…</p>;
  if (!verified) return null; // ← never render children until OK
  return <>{children}</>;
}
