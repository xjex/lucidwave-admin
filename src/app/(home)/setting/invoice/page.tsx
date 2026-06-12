"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LegacyInvoiceSettingsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/settings/invoice");
  }, [router]);

  return null;
}
