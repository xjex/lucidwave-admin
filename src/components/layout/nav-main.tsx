"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  Handshake,
  History,
  Briefcase,
  Folder,
  UserCog,
  IdCard,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  items?: { title: string; url: string }[];
}

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  {
    title: "Invoices",
    url: "/invoice",
    icon: FileText,
    items: [{ title: "Send Invoice", url: "/invoice" }],
  },
  {
    title: "Receipts",
    url: "/receipts",
    icon: Receipt,
    items: [{ title: "Send Receipt", url: "/receipts" }],
  },
  {
    title: "Contacts",
    url: "/contacts/web-reach",
    icon: Users,
    items: [
      { title: "Website Reach Out", url: "/contacts/web-reach" },
      { title: "Contact List", url: "/contacts/list" },
    ],
  },
  {
    title: "Clients",
    url: "/clients",
    icon: Handshake,
    items: [{ title: "Clients List", url: "/clients" }],
  },
  { title: "Mailing History", url: "/mailing-history", icon: History },
  {
    title: "Employees",
    url: "/employees",
    icon: IdCard,
    items: [
      { title: "Employees List", url: "/employees" },
      { title: "Payroll History", url: "/employees/payroll-history" },
    ],
  },
  {
    title: "Careers",
    url: "/careers",
    icon: Briefcase,
    items: [
      { title: "Job Listings", url: "/careers/jobs" },
      { title: "Applications", url: "/careers/applications" },
    ],
  },
  { title: "Portfolio", url: "/portfolio", icon: Folder },
  {
    title: "Users Management",
    url: "/users",
    icon: UserCog,
    items: [
      { title: "Users", url: "/users" },
      { title: "Invitations", url: "/users/invitations" },
    ],
  },
];

function isActive(pathname: string, url: string) {
  if (url === "#") return false;
  return pathname === url || pathname.startsWith(`${url}/`);
}

export function NavMain() {
  const pathname = usePathname();

  return (
    <nav className="px-3 py-2">
      <p className="mb-3 px-3 font-mono text-[10px] uppercase tracking-wider text-[#f8f1e5]/40">
        Platform
      </p>
      <ul className="space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(pathname, item.url);
          const hasSubItems = item.items && item.items.length > 0;
          const subActive =
            hasSubItems && item.items?.some((s) => isActive(pathname, s.url));
          const expanded = active || subActive;

          return (
            <li key={item.title}>
              <Link
                href={item.url}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                  active || subActive
                    ? "border-l-2 border-[#d95c3f] bg-[#f8f1e5]/8 text-[#f8f1e5]"
                    : "border-l-2 border-transparent text-[#f8f1e5]/65 hover:bg-[#f8f1e5]/5 hover:text-[#f8f1e5]"
                }`}
              >
                <item.icon className="size-4 shrink-0" />
                <span className="font-medium">{item.title}</span>
                {hasSubItems && (
                  <ChevronRight
                    className={`ml-auto size-3.5 shrink-0 transition-transform ${
                      expanded ? "rotate-90" : ""
                    }`}
                  />
                )}
              </Link>
              {hasSubItems && expanded && (
                <ul className="mt-0.5 ml-6 border-l border-[#f8f1e5]/10 pl-3 space-y-0.5">
                  {item.items?.map((sub) => {
                    const subItemActive = isActive(pathname, sub.url);
                    return (
                      <li key={sub.title}>
                        <Link
                          href={sub.url}
                          className={`block px-3 py-1.5 text-sm transition-colors ${
                            subItemActive
                              ? "text-[#e0b84f]"
                              : "text-[#f8f1e5]/50 hover:text-[#f8f1e5]/90"
                          }`}
                        >
                          {sub.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
