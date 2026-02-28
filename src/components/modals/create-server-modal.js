"use client";

import { useState } from "react";
import { X, Upload } from "lucide-react";
import { useModalStore } from "@/store/modal-store";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function CreateServerModal() {
  const { isOpen, type, onClose } = useModalStore();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const isVisible = isOpen && type === "createServer";
  if (!isVisible) return null;

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const server = await res.json();
        onClose();
        setName("");
        window.location.href = `/servers/${server.id}`;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <div
        className="relative w-full max-w-md rounded-lg overflow-hidden shadow-2xl"
        style={{ background: "#313338" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full transition-colors hover:bg-[var(--surface)]"
          style={{ color: "var(--text-secondary)" }}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="pt-8 pb-4 px-6 text-center">
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Customize Your Server
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Give your new server a personality with a name and an icon. You can
            always change it later.
          </p>
        </div>

        {/* Icon upload area */}
        <div className="flex justify-center my-4">
          <button
            className="w-24 h-24 rounded-full border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-colors hover:bg-[var(--surface)]"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            <Upload className="w-6 h-6" />
            <span className="text-xs font-medium">UPLOAD</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleCreate} className="px-6 pb-6">
          <div className="mb-4">
            <label
              className="block text-xs font-bold uppercase mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              Server Name <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Server"
              className="w-full rounded px-3 py-2.5 text-sm outline-none"
              style={{
                background: "var(--input-bg)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }}
              autoFocus
              maxLength={100}
            />
          </div>

          <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>
            By creating a server, you agree to Discord Clone's Community
            Guidelines.
          </p>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium transition-colors hover:underline"
              style={{ color: "var(--text-primary)" }}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="px-6 py-2 rounded text-sm font-semibold text-white transition-colors disabled:opacity-50"
              style={{
                background: loading ? "var(--primary-hover)" : "var(--primary)",
              }}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
