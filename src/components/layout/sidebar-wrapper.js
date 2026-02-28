"use client";

import { useUIStore } from "@/store/ui-store";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function SidebarWrapper({ children }) {
  const { mobileOpen, setMobileOpen } = useUIStore();
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  return (
    <>
      {/* Desktop view */}
      <div className="hidden md:flex h-full shrink-0">{children}</div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Sidebar Drawer */}
          <div className="relative flex h-full max-w-[85%] bg-black transition-transform shadow-2xl">
            {children}
          </div>
        </div>
      )}
    </>
  );
}
