"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";

// Dynamically import the sidebar components with SSR disabled
const SidebarLayout = dynamic(() => import("./sidebar-layout"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-muted animate-pulse" />
            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            <div className="flex items-center gap-2">
              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </header>
        <div className="flex-1 bg-background" />
      </div>
    </div>
  ),
}) as React.ComponentType<{ children: React.ReactNode; pageTitle: string }>;

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

  // Determine page title based on pathname
  const getPageTitle = (path: string) => {
    if (path === "/dashboard") return "Dashboard";
    if (path === "/invoice") return "Send Invoice";
    if (path === "/receipts") return "Send Receipt";
    if (path === "/contacts") return "Website Contacts";
    if (path === "/contacts/list") return "Contact List";
    if (path === "/mailing-history") return "Mailing History";
    if (path === "/users") return "Users";
    return "Dashboard";
  };

  const pageTitle = getPageTitle(pathname);

  if (!authChecked) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <SidebarLayout pageTitle={pageTitle}>{children}</SidebarLayout>;
}
