"use client";

import { ShieldCheck } from "lucide-react";

export function TeamSwitcher() {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <div className="grid size-9 place-items-center border border-[#f8f1e5]/25 bg-[#f8f1e5]/10">
        <ShieldCheck className="size-4 text-[#f8f1e5]" />
      </div>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-[#f8f1e5]/55">
          Lucidwave Studios
        </p>
        <p className="font-serif text-base text-[#f8f1e5]">
          Invoicer Control
        </p>
      </div>
    </div>
  );
}
