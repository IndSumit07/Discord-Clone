"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Compass } from "lucide-react";
import { useModalStore } from "@/store/modal-store";
import { cn } from "@/lib/utils";

function ServerIcon({ server, isActive }) {
  const initials = server.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link
      href={`/servers/${server.id}`}
      className="group relative flex items-center"
    >
      {/* Active indicator pill */}
      <div
        className={cn(
          "absolute -left-3 w-1 rounded-r-full bg-white transition-all duration-200",
          isActive ? "h-9" : "h-2 group-hover:h-5",
        )}
      />
      <div
        className={cn(
          "w-12 h-12 flex items-center justify-center font-semibold text-sm transition-all duration-200 overflow-hidden",
          isActive
            ? "rounded-2xl text-white"
            : "rounded-[50%] text-[#DCDDDE] group-hover:rounded-2xl",
        )}
        style={{
          background: server.icon_url ? undefined : "var(--primary)",
          backgroundImage: server.icon_url
            ? `url(${server.icon_url})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        title={server.name}
      >
        {!server.icon_url && initials}
      </div>
    </Link>
  );
}

export default function ServerSidebar({ servers = [] }) {
  const pathname = usePathname();
  const { onOpen } = useModalStore();

  const isDMActive = pathname.startsWith("/channels/@me");

  return (
    <nav
      className="flex w-[72px] shrink-0 flex-col items-center gap-2 overflow-y-auto overflow-x-hidden py-3"
      style={{ background: "var(--server-sidebar)" }}
    >
      {/* DM Home Icon */}
      <Link href="/channels/@me" className="group relative flex items-center">
        <div
          className={cn(
            "absolute -left-3 w-1 rounded-r-full bg-white transition-all duration-200",
            isDMActive ? "h-9" : "h-2 group-hover:h-5",
          )}
        />
        <div
          className={cn(
            "w-12 h-12 flex items-center justify-center transition-all duration-200",
            isDMActive
              ? "rounded-2xl"
              : "rounded-[50%] group-hover:rounded-2xl",
          )}
          style={{
            background: isDMActive ? "var(--primary)" : "var(--sidebar-bg)",
          }}
        >
          <svg
            className={cn(
              "w-7 h-7 transition-colors",
              isDMActive
                ? "text-white"
                : "text-[#5865F2] group-hover:text-white",
            )}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19.73 4.87a18.2 18.2 0 0 0-4.6-1.44c-.21.4-.4.8-.58 1.21-1.69-.25-3.4-.25-5.1 0-.18-.41-.37-.82-.59-1.2-1.6.27-3.14.75-4.6 1.43A19.04 19.04 0 0 0 .96 17.7a12.5 12.5 0 0 0 3.84 1.96c.4-.55.76-1.13 1.07-1.74a7.31 7.31 0 0 1-1.52-.73c.12-.1.25-.21.37-.31 3.22 1.49 6.68 1.49 9.86 0 .13.1.25.21.37.31-.48.29-1 .54-1.52.73.31.61.68 1.19 1.07 1.74a12.44 12.44 0 0 0 3.85-1.95 19.18 19.18 0 0 0-3.3-12.84Z" />
          </svg>
        </div>
      </Link>

      {/* Divider */}
      <div
        className="mx-auto my-1 h-[2px] w-8 rounded-full"
        style={{ background: "var(--border)" }}
      />

      {/* Server list */}
      {servers.map((server) => (
        <ServerIcon
          key={server.id}
          server={server}
          isActive={pathname.startsWith(`/servers/${server.id}`)}
        />
      ))}

      {/* Add Server */}
      <button
        onClick={() => onOpen("createServer")}
        className="group relative flex items-center mt-1"
        title="Add a Server"
      >
        <div
          className="w-12 h-12 flex items-center justify-center rounded-[50%] transition-all duration-200 group-hover:rounded-2xl"
          style={{
            background: "var(--sidebar-bg)",
            color: "var(--success)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--success)";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--sidebar-bg)";
            e.currentTarget.style.color = "var(--success)";
          }}
        >
          <Plus className="w-6 h-6" />
        </div>
      </button>

      {/* Discovery */}
      <button
        className="group flex items-center"
        title="Explore Public Servers"
      >
        <div
          className="w-12 h-12 flex items-center justify-center rounded-[50%] transition-all duration-200 group-hover:rounded-2xl"
          style={{ background: "var(--sidebar-bg)", color: "var(--success)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--success)";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--sidebar-bg)";
            e.currentTarget.style.color = "var(--success)";
          }}
        >
          <Compass className="w-6 h-6" />
        </div>
      </button>
    </nav>
  );
}
