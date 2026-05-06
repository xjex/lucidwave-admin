"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeft } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";

interface SidebarLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

const segmentLabels: Record<string, string> = {
  dashboard: "Dashboard",
  invoice: "Send Invoice",
  receipts: "Send Receipt",
  contacts: "Contacts",
  "web-reach": "Website Contacts",
  list: "Contact List",
  "mailing-history": "Mailing History",
  careers: "Careers",
  jobs: "Job Listings",
  applications: "Applications",
  portfolio: "Portfolio",
  users: "Users",
  invitations: "User Invitations",
};

export default function SidebarLayout({
  children,
  pageTitle,
}: SidebarLayoutProps) {
  const pathname = usePathname();

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter((segment) => segment !== "(home)");

  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const isIdSegment =
      /^[a-f0-9]{24}$/i.test(segment) ||
      (index > 0 && segments[index - 1] === "applications" && !segmentLabels[segment]);

    const label = isIdSegment
      ? "View"
      : segmentLabels[segment] ||
        segment.charAt(0).toUpperCase() + segment.slice(1);

    return {
      href,
      label,
      isLast: index === segments.length - 1,
    };
  });

  if (breadcrumbs.length === 0) {
    breadcrumbs.push({
      href: "/dashboard",
      label: "Dashboard",
      isLast: true,
    });
  } else {
    breadcrumbs[breadcrumbs.length - 1].label = pageTitle;
  }

  return (
    <div className="flex min-h-screen bg-[#f4efe4]">
      <AppSidebar />

      <div className="ml-64 flex flex-1 flex-col">
        {/* Top header bar */}
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-[#241d18]/10 bg-[#fffaf1] px-6">
          <button
            className="grid size-8 place-items-center border border-[#241d18]/15 bg-white text-[#574d43] transition-colors hover:border-[#8b4a36] hover:text-[#8b4a36]"
            title="Toggle sidebar"
          >
            <PanelLeft className="size-4" />
          </button>

          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.href || index} className="flex items-center gap-2">
                  {index > 0 && (
                    <span className="text-[#9d9389]">/</span>
                  )}
                  {crumb.isLast ? (
                    <span className="font-mono text-[11px] uppercase tracking-wide text-[#8b4a36]">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="font-mono text-[11px] uppercase tracking-wide text-[#6f665d] transition-colors hover:text-[#241d18]"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
