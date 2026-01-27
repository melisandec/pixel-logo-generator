"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/test-generator");
  }, [router]);

  return (
    <div style={{ textAlign: "center", paddingTop: "2rem" }}>
      <p>Redirecting to test generator...</p>
    </div>
  );
}
