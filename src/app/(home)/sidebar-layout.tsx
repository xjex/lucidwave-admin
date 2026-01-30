"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface SidebarLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

export default function SidebarLayout({
  children,
  pageTitle,
}: SidebarLayoutProps) {
  const pathname = usePathname();

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

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter((segment) => segment !== "(home)");

  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    // Check if this is a dynamic ID segment (MongoDB ObjectId pattern or any ID after "applications")
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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <Fragment key={crumb.href || index}>
                    <BreadcrumbItem>
                      {crumb.isLast ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={crumb.href}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!crumb.isLast && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
