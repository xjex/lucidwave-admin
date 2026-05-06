"use client";

import { LogOut, User } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    role?: string;
  };
}) {
  const { logout } = useAuthStore();

  return (
    <div className="border-t border-[#f8f1e5]/10 px-3 py-4">
      <div className="mb-3 px-3 font-mono text-[10px] uppercase tracking-wider text-[#f8f1e5]/40">
        Account
      </div>
      <div className="flex items-center gap-3 px-3 py-2">
        <div className="grid size-9 place-items-center border border-[#f8f1e5]/20 bg-[#f8f1e5]/10">
          <User className="size-4 text-[#f8f1e5]/70" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[#f8f1e5]">
            {user.name}
          </p>
          <p className="truncate font-mono text-[11px] text-[#f8f1e5]/50">
            {user.email}
          </p>
          {user.role && (
            <p className="mt-0.5 inline-block border border-[#e0b84f]/30 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#e0b84f]">
              {user.role}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={logout}
        className="mt-2 flex w-full items-center gap-3 border border-[#f8f1e5]/10 bg-transparent px-3 py-2.5 text-sm text-[#f8f1e5]/65 transition-colors hover:border-[#b73823]/50 hover:bg-[#b73823]/10 hover:text-[#f8f1e5]"
      >
        <LogOut className="size-4" />
        <span className="font-mono text-[11px] uppercase tracking-wide">
          Sign out
        </span>
      </button>
    </div>
  );
}
