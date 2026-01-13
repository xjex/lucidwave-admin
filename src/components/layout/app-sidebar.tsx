"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Briefcase,
  Command,
  Frame,
  GalleryVerticalEnd,
  History,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Users,
  UserCog,
} from "lucide-react";

import { NavMain } from "@/components/layout/nav-main";
import { NavProjects } from "@/components/layout/nav-projects";
import { NavUser } from "@/components/layout/nav-user";
import { TeamSwitcher } from "@/components/layout/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/authStore";
import { usePathname } from "next/navigation";

// This is sample data.
const data = {
  user: {
    name: "John Doe",
    email: "john@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Lucid Wave Studio Team",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
    },
    {
      title: "Invoices",
      url: "/invoice",
      icon: Bot,
      items: [
        {
          title: "Send Invoice",
          url: "/invoice",
        },
      ],
    },
    {
      title: "Receipts",
      url: "/receipts",
      icon: BookOpen,
      items: [
        {
          title: "Send Receipt",
          url: "/receipts",
        },
      ],
    },
    {
      title: "Contacts",
      url: "/contacts/web-reach",
      icon: Users,
      items: [
        {
          title: "Website Reach Out",
          url: "/contacts/web-reach",
        },
        {
          title: "Contact List",
          url: "/contacts/list",
        },
      ],
      isActive: false,
    },
    {
      title: "Mailing History",
      url: "/mailing-history",
      icon: History,
      isActive: false,
    },
    {
      title: "Careers",
      url: "/careers",
      icon: Briefcase,
      items: [
        {
          title: "Job Listings",
          url: "/careers/jobs",
        },
        {
          title: "Applications",
          url: "/careers/applications",
        },
      ],
      isActive: false,
    },
    {
      title: "Users Management",
      url: "/users",
      icon: UserCog,
      isActive: false,
      items: [
        {
          title: "Users",
          url: "/users",
        },
        {
          title: "User Invitation",
          url: "/users/invitations",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Recent Invoices",
      url: "#",
      icon: Frame,
    },
    {
      name: "Recent Receipts",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Reports",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore();
  const pathname = usePathname();

  const matchPath = React.useCallback(
    (target?: string) => {
      if (!target || target === "#") return false;
      return pathname === target || pathname.startsWith(`${target}/`);
    },
    [pathname]
  );

  const navItems = React.useMemo(() => {
    return data.navMain.map((item) => {
      if (item.items && item.items.length > 0) {
        const subItems = item.items.map((subItem) => ({
          ...subItem,
          isActive: matchPath(subItem.url),
        }));

        const isActive =
          matchPath(item.url) || subItems.some((sub) => sub.isActive);

        return {
          ...item,
          isActive,
          items: subItems,
        };
      }

      return {
        ...item,
        isActive: matchPath(item.url),
      };
    });
  }, [matchPath]);

  // Ensure user data has required avatar field
  const currentUser = user
    ? {
        ...user,
        avatar:
          user.avatar || `/avatars/${user.email.charAt(0).toLowerCase()}.jpg`,
      }
    : {
        name: "Guest User",
        email: "guest@example.com",
        avatar: "/avatars/guest.jpg",
        role: "Guest",
      };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
