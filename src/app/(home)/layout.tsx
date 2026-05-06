"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import SidebarLayout from "./sidebar-layout";

interface HomeLayoutProps {
  children: React.ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      await checkAuth();
      setAuthChecked(true);
    };
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (authChecked && !isAuthenticated && typeof window !== "undefined") {
      router.push("/");
    }
  }, [authChecked, isAuthenticated, router]);

  const getPageTitle = (path: string) => {
    if (path === "/dashboard") return "Dashboard";
    if (path === "/invoice") return "Send Invoice";
    if (path === "/receipts") return "Send Receipt";
    if (path === "/contacts/web-reach") return "Website Contacts";
    if (path === "/contacts/list") return "Contact List";
    if (path === "/clients") return "Clients List";
    if (path.startsWith("/clients/")) return "Client Account";
    if (path === "/contacts/clients") return "Clients List";
    if (path === "/mailing-history") return "Mailing History";
    if (path === "/employees") return "Employees List";
    if (path === "/employees/payroll-history") return "Payroll History";
    if (path === "/careers") return "Careers";
    if (path === "/careers/jobs") return "Job Listings";
    if (path === "/careers/applications") return "Applications";
    if (path.startsWith("/careers/applications/")) return "Job Applications";
    if (path === "/portfolio") return "Portfolio";
    if (path === "/users") return "Users";
    if (path === "/users/invitations") return "User Invitations";
    return "Dashboard";
  };

  const pageTitle = getPageTitle(pathname);

  if (!authChecked) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4efe4]">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 border-2 border-[#241d18]/15 border-t-[#8b4a36] animate-spin" />
          <p className="font-mono text-xs uppercase text-[#6f665d]">
            Checking authentication…
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <SidebarLayout pageTitle={pageTitle}>{children}</SidebarLayout>;
}
