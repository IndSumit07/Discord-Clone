"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Settings,
  PlusCircle,
  UserPlus,
  Trash2,
  LogOut,
  FolderPlus,
} from "lucide-react";
import { useModalStore } from "@/store/modal-store";

export default function ServerHeader({ server, profile }) {
  const [isOpen, setIsOpen] = useState(false);
  const { onOpen } = useModalStore();
  const dropdownRef = useRef(null);

  const isAdmin = server?.owner_id === profile?.id;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-12 w-full items-center justify-between px-4 shadow-sm transition-colors hover:bg-(--surface-hover) focus:outline-none"
        style={{
          boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
        }}
      >
        <span className="truncate font-semibold text-(--text-primary)">
          {server?.name ?? "Server"}
        </span>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          style={{ color: "var(--text-primary)" }}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-12 left-2 right-2 z-50 mt-1 rounded-md p-2 shadow-xl animate-in fade-in zoom-in duration-100"
          style={{ background: "#111214" }} // Discord dropdown background
        >
          {/* Invite */}
          <button
            onClick={() => {
              onOpen("invite", { server });
              setIsOpen(false);
            }}
            className="flex w-full items-center justify-between rounded px-2 py-2 text-sm font-medium transition-colors hover:bg-(--primary) text-(--primary) hover:text-white"
          >
            Invite People
            <UserPlus className="w-4 h-4" />
          </button>

          {isAdmin && (
            <>
              {/* Server Settings */}
              <button
                onClick={() => {
                  onOpen("serverSettings", { server });
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-between rounded px-2 py-2 text-sm font-medium transition-colors hover:bg-(--primary) text-(--text-secondary) hover:text-white"
              >
                Server Settings
                <Settings className="w-4 h-4" />
              </button>

              {/* Create Channel */}
              <button
                onClick={() => {
                  onOpen("createChannel", { server });
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-between rounded px-2 py-2 text-sm font-medium transition-colors hover:bg-(--primary) text-(--text-secondary) hover:text-white"
              >
                Create Channel
                <PlusCircle className="w-4 h-4" />
              </button>

              {/* Create Category */}
              <button
                onClick={() => {
                  // We could add a Category modal later, for now reuse CreateChannel with flag
                  onOpen("createChannel", { server, isCategory: true });
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-between rounded px-2 py-2 text-sm font-medium transition-colors hover:bg-(--primary) text-(--text-secondary) hover:text-white"
              >
                Create Category
                <FolderPlus className="w-4 h-4" />
              </button>
            </>
          )}

          <div className="my-1 h-px bg-white/5" />

          {isAdmin ? (
            <button
              onClick={() => {
                onOpen("serverSettings", { server }); // Open settings which has delete? or dedicated modal
                setIsOpen(false);
              }}
              className="flex w-full items-center justify-between rounded px-2 py-2 text-sm font-medium transition-colors hover:bg-(--danger) text-(--danger) hover:text-white"
            >
              Delete Server
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                // To be implemented: leaveServer API
                alert("Leaving server...");
                setIsOpen(false);
              }}
              className="flex w-full items-center justify-between rounded px-2 py-2 text-sm font-medium transition-colors hover:bg-(--danger) text-(--danger) hover:text-white"
            >
              Leave Server
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
