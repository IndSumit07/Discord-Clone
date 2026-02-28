"use client";

import { useState } from "react";
import {
  Plus,
  Users,
  Search,
  Mic,
  Headphones,
  Settings,
  X,
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";

function TooltipWrapper({ children, content, side = "top" }) {
  return (
    <Tooltip.Provider delayDuration={50}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side={side}
            className="px-3 py-1.5 rounded text-sm font-semibold shadow-lg animate-in fade-in zoom-in-95"
            style={{ background: "#111214", color: "var(--text-primary)" }}
            sideOffset={5}
          >
            {content}
            <Tooltip.Arrow className="fill-[#111214]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export default function DMSidebar({ conversations = [] }) {
  const [search, setSearch] = useState("");
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isFriendsActive =
    pathname === "/channels/@me" || pathname === "/channels/me";

  return (
    <div
      className="w-60 h-full flex flex-col shrink-0"
      style={{ background: "var(--sidebar-bg)" }}
    >
      {/* Search Header */}
      <div
        className="h-12 flex items-center justify-center px-2.5 shrink-0 border-b"
        style={{
          borderColor: "var(--background)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
        }}
      >
        <button
          className="w-full flex items-center justify-between text-sm rounded px-2 py-1.5 transition-colors"
          style={{
            background: "var(--background)",
            color: "var(--text-muted)",
          }}
        >
          <span className="truncate">Find or start a conversation</span>
        </button>
      </div>

      <ScrollArea.Root className="flex-1 overflow-hidden">
        <ScrollArea.Viewport className="h-full w-full py-2">
          {/* Friends Link */}
          <div className="px-2 mb-4">
            <button
              onClick={() => router.push("/channels/@me")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded group transition-colors"
              style={{
                background: isFriendsActive ? "var(--surface)" : "transparent",
                color: isFriendsActive
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                if (!isFriendsActive)
                  e.currentTarget.style.background = "var(--surface-hover)";
              }}
              onMouseLeave={(e) => {
                if (!isFriendsActive)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              <Users
                className="w-5 h-5"
                style={{ color: "var(--text-muted)" }}
              />
              <span className="font-semibold text-sm">Friends</span>
            </button>
          </div>

          {/* Direct Messages Header */}
          <div className="px-4 mb-1 pt-4 flex items-center justify-between group">
            <h2
              className="text-xs font-semibold uppercase hover:text-[var(--text-primary)] transition-colors cursor-default"
              style={{ color: "var(--text-muted)" }}
            >
              Direct Messages
            </h2>
            <TooltipWrapper content="Create DM">
              <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </TooltipWrapper>
          </div>

          {/* DM List */}
          <div className="px-2 flex flex-col gap-0.5">
            {conversations.map((c) => {
              const otherUser = c.profile;
              const isActive =
                pathname === `/channels/me/${c.id}` ||
                pathname === `/channels/@me/${c.id}`;
              return (
                <div
                  key={c.id}
                  onClick={() => router.push(`/channels/@me/${c.id}`)}
                  className="flex items-center gap-3 px-2 py-2 rounded group cursor-pointer transition-colors"
                  style={{
                    background: isActive ? "var(--surface)" : "transparent",
                    color: isActive
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      e.currentTarget.style.background = "var(--surface-hover)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  {/* Avatar */}
                  <div className="relative w-8 h-8 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xs overflow-hidden">
                      {otherUser?.avatar_url ? (
                        <img
                          src={otherUser.avatar_url}
                          alt="av"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        otherUser?.display_name?.[0]?.toUpperCase()
                      )}
                    </div>
                    {/* Status Indicator (Hardcoded online for now) */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-[var(--sidebar-bg)] bg-[var(--text-muted)] group-hover:border-[var(--surface-hover)] transition-colors" />
                  </div>

                  {/* Username */}
                  <div className="flex-1 truncate">
                    <span className="text-base font-medium truncate">
                      {otherUser?.display_name || otherUser?.username}
                    </span>
                  </div>

                  {/* Close button (Hidden until hover) */}
                  <div className="w-4 h-4 hidden group-hover:flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                    <X className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          orientation="vertical"
          className="flex select-none touch-none p-0.5 transition-colors duration-[160ms] ease-out hover:bg-black/10 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
        >
          <ScrollArea.Thumb className="flex-1 bg-[rgba(26,27,30,0.5)] rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>

      {/* User Panel */}
      <div
        className="h-14 shrink-0 flex items-center px-2 py-1.5"
        style={{ background: "#232428" }}
      >
        <div className="flex items-center gap-2 p-1 -ml-1 rounded transition-colors hover:bg-[var(--surface-hover)] cursor-pointer mr-auto min-w-0">
          <div className="relative shrink-0">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 rounded-full",
                  userButtonTrigger: "block",
                },
              }}
              afterSignOutUrl="/"
            />
            {/* User status */}
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-[3px] border-[#232428] bg-[var(--success)] pointer-events-none" />
          </div>
          <div className="flex flex-col min-w-0 pb-0.5">
            <span
              className="text-sm font-bold truncate leading-none"
              style={{ color: "var(--text-primary)" }}
            >
              {user?.username ?? "Loading..."}
            </span>
            <span
              className="text-xs truncate"
              style={{ color: "var(--text-muted)", fontSize: "11px" }}
            >
              Online
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div
          className="flex items-center shrink-0"
          style={{ color: "var(--text-secondary)" }}
        >
          <TooltipWrapper content="Mute">
            <button className="w-8 h-8 rounded flex items-center justify-center transition-colors hover:bg-[var(--surface-hover)]">
              <Mic className="w-5 h-5" />
            </button>
          </TooltipWrapper>
          <TooltipWrapper content="Deafen">
            <button className="w-8 h-8 rounded flex items-center justify-center transition-colors hover:bg-[var(--surface-hover)]">
              <Headphones className="w-5 h-5" />
            </button>
          </TooltipWrapper>
          <TooltipWrapper content="User Settings">
            <button className="w-8 h-8 rounded flex items-center justify-center transition-colors hover:bg-[var(--surface-hover)]">
              <Settings className="w-5 h-5" />
            </button>
          </TooltipWrapper>
        </div>
      </div>
    </div>
  );
}
