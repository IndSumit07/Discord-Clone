"use client";

import { useModalStore } from "@/store/modal-store";
import { Copy, X, Check } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";

export default function InviteModal() {
  const { isOpen, onClose, type, data } = useModalStore();
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  const isModalOpen = isOpen && type === "invite";
  const { server } = data;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  if (!isModalOpen || !server) return null;

  const inviteUrl = `${origin}/invite/${server.id}`;

  const onCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <div
        className="relative w-full max-w-md rounded-lg overflow-hidden shadow-2xl"
        style={{ background: "#313338" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full transition-colors hover:bg-[var(--surface-hover)]"
          style={{ color: "var(--text-secondary)" }}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <h2
            className="text-xl font-bold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Invite friends to {server?.name}
          </h2>

          <div className="mt-2 text-sm">
            <label
              className="uppercase text-xs font-bold mb-2 block"
              style={{ color: "var(--text-muted)" }}
            >
              Send a server invite link to a friend
            </label>
            <div className="flex items-center gap-x-2 mt-2">
              <input
                readOnly
                className="flex-1 bg-[var(--input-bg)] py-2 px-3 rounded border border-transparent outline-none focus:border-[var(--primary)] text-sm"
                style={{ color: "var(--text-primary)" }}
                value={inviteUrl}
              />
              <button
                disabled={copied}
                onClick={onCopy}
                className="transition-colors rounded px-4 py-2 font-medium text-white flex items-center justify-center min-w-[75px]"
                style={{
                  background: copied ? "var(--success)" : "var(--primary)",
                }}
              >
                {copied ? <Check className="w-4 h-4" /> : "Copy"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-4 px-6 text-xs"
          style={{
            background: "var(--sidebar-bg)",
            color: "var(--text-muted)",
          }}
        >
          Your invite link is ready!
        </div>
      </div>
    </div>
  );
}
