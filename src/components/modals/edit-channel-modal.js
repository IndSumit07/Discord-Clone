"use client";

import { useState, useEffect } from "react";
import { X, Hash, Volume2, Video } from "lucide-react";
import { useModalStore } from "@/store/modal-store";
import { useRouter } from "next/navigation";

export default function EditChannelModal() {
  const { isOpen, type, onClose, data } = useModalStore();
  const [name, setName] = useState("");
  const [channelType, setChannelType] = useState("text");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isVisible = isOpen && type === "editChannel";
  const { server, channel } = data;

  useEffect(() => {
    if (channel) {
      setName(channel.name);
      setChannelType(channel.type || "text");
    }
  }, [channel]);

  if (!isVisible) return null;

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/channels/${channel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.toLowerCase().replace(/\s+/g, "-"),
          type: channelType,
        }),
      });

      if (res.ok) {
        onClose();
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    const confirmDelete = confirm(
      "Are you sure you want to delete this channel?",
    );
    if (!confirmDelete) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/channels/${channel.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        onClose();
        router.push(`/servers/${server.id}`);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <div
        className="relative w-full max-w-sm rounded-lg shadow-xl flex flex-col overflow-hidden"
        style={{ background: "#313338" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full transition-colors hover:bg-[var(--surface-hover)]"
          style={{ color: "var(--text-secondary)" }}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 pb-4">
          <h2
            className="text-xl font-bold mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Edit Channel
          </h2>

          <div className="space-y-4">
            <div>
              <label
                className="block text-xs font-bold uppercase mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                CHANNEL NAME
              </label>
              <div
                className="flex items-center gap-2 rounded px-3 py-2.5 outline-none mb-1"
                style={{
                  background: "var(--input-bg)",
                  border: "1px solid var(--border)",
                }}
              >
                {channelType === "text" ? (
                  <Hash className="w-4 h-4 text-[var(--text-muted)]" />
                ) : channelType === "voice" ? (
                  <Volume2 className="w-4 h-4 text-[var(--text-muted)]" />
                ) : (
                  <Video className="w-4 h-4 text-[var(--text-muted)]" />
                )}
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: "var(--text-primary)" }}
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-bold uppercase mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                CHANNEL TYPE
              </label>
              <select
                value={channelType}
                onChange={(e) => setChannelType(e.target.value)}
                className="w-full bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--border)] rounded px-3 py-2 text-sm outline-none"
              >
                <option value="text">Text</option>
                <option value="voice">Voice</option>
                <option value="video">Video</option>
              </select>
            </div>

            <button
              onClick={handleDelete}
              className="w-full text-left flex items-center gap-2 text-sm font-medium text-[var(--danger)] hover:bg-[var(--danger)]/10 p-2 rounded transition-colors"
            >
              Delete Channel
            </button>
          </div>
        </div>

        <div
          className="p-4 flex items-center justify-end gap-4"
          style={{ background: "var(--sidebar-bg)" }}
        >
          <button
            onClick={onClose}
            className="text-sm font-medium text-white hover:underline"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || loading}
            className="px-6 py-2 rounded text-sm font-semibold text-white transition-colors disabled:opacity-50"
            style={{ background: "var(--primary)" }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
