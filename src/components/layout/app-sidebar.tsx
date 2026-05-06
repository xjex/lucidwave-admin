"use client";

import { TeamSwitcher } from "@/components/layout/team-switcher";
import { NavMain } from "@/components/layout/nav-main";
import { NavUser } from "@/components/layout/nav-user";
import { useAuthStore } from "@/stores/authStore";

export function AppSidebar() {
  const { user } = useAuthStore();

  const currentUser = user
    ? {
        name: user.name || "User",
        email: user.email || "user@example.com",
        role: user.role || undefined,
      }
    : {
        name: "Guest User",
        email: "guest@example.com",
        role: "Guest",
      };

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-[#f8f1e5]/10 bg-[#24231f]"
      style={{
        backgroundImage:
          "linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "46px 46px",
      }}
    >
      <div className="absolute right-0 top-0 h-32 w-1 bg-[#d95c3f]" />

      <div className="shrink-0 px-3 py-6">
        <TeamSwitcher />
      </div>

      <div className="flex-1 overflow-y-auto">
        <NavMain />
      </div>

      <div className="shrink-0">
        <NavUser user={currentUser} />
      </div>
    </aside>
  );
}
