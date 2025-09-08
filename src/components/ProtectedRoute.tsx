"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

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
      localStorage.removeItem("token");
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) return <p>Loading…</p>;
  if (!verified) return null; // ← never render children until OK
  return <>{children}</>;
}
