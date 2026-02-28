"use client";

import { useUIStore } from "@/store/ui-store";
import { Menu } from "lucide-react";

export default function MobileToggle() {
  const { setMobileOpen } = useUIStore();

  return (
    <button
      onClick={() => setMobileOpen(true)}
      className="md:hidden mr-2 p-1 rounded transition-colors hover:bg-[var(--surface-hover)]"
      style={{ color: "var(--text-secondary)" }}
    >
      <Menu className="w-6 h-6" />
    </button>
  );
}
