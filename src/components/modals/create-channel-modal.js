"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useModalStore } from "@/store/modal-store";
import { useRouter } from "next/navigation";

export default function CreateChannelModal() {
  const { isOpen, type, onClose, data } = useModalStore();
  const [name, setName] = useState("");
  const [channelType, setChannelType] = useState("text");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isVisible = isOpen && type === "createChannel";
  const { server, category } = data;

  if (!isVisible) return null;

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/servers/${server.id}/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.toLowerCase().replace(/\s+/g, "-"),
          type: channelType,
          category_id: category?.id,
        }),
      });

      if (res.ok) {
        onClose();
        setName("");
        setChannelType("text");
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
        className="relative w-full max-w-md rounded-lg shadow-xl flex flex-col overflow-hidden"
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
            className="text-xl font-bold mb-2 text-center"
            style={{ color: "var(--text-primary)" }}
          >
            Create Channel
          </h2>
          {category && (
            <p className="text-sm text-center mb-4 text-[var(--text-muted)]">
              in {category.name}
            </p>
          )}

          <div className="space-y-6">
            {/* Type selector */}
            <div>
              <label
                className="block text-xs font-bold uppercase mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                CHANNEL TYPE
              </label>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setChannelType("text")}
                  className={`flex items-center gap-3 w-full p-3 rounded text-left transition-colors border ${channelType === "text" ? "border-[var(--primary)] bg-[var(--surface-hover)]" : "border-transparent bg-[var(--surface)] hover:bg-[var(--surface-hover)]"}`}
                >
                  <span className="text-2xl text-[var(--text-muted)]">#</span>
                  <div className="flex-1">
                    <div
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Text
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Post images, GIFs, stickers, opinions, and puns
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${channelType === "text" ? "border-[var(--primary)]" : "border-[var(--text-muted)]"}`}
                  >
                    {channelType === "text" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setChannelType("voice")}
                  className={`flex items-center gap-3 w-full p-3 rounded text-left transition-colors border ${channelType === "voice" ? "border-[var(--primary)] bg-[var(--surface-hover)]" : "border-transparent bg-[var(--surface)] hover:bg-[var(--surface-hover)]"}`}
                >
                  <span className="text-2xl text-[var(--text-muted)]">🔊</span>
                  <div className="flex-1">
                    <div
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Voice
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Hang out together with voice, video, and screen share
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${channelType === "voice" ? "border-[var(--primary)]" : "border-[var(--text-muted)]"}`}
                  >
                    {channelType === "voice" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setChannelType("video")}
                  className={`flex items-center gap-3 w-full p-3 rounded text-left transition-colors border ${channelType === "video" ? "border-[var(--primary)] bg-[var(--surface-hover)]" : "border-transparent bg-[var(--surface)] hover:bg-[var(--surface-hover)]"}`}
                >
                  <span className="text-2xl text-[var(--text-muted)]">📹</span>
                  <div className="flex-1">
                    <div
                      className="text-sm font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Video
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Dedicated high-quality video calling
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${channelType === "video" ? "border-[var(--primary)]" : "border-[var(--text-muted)]"}`}
                  >
                    {channelType === "video" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
                    )}
                  </div>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
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
                <span className="text-[var(--text-muted)]">
                  {channelType === "text"
                    ? "#"
                    : channelType === "voice"
                      ? "🔊"
                      : "📹"}
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="new-channel"
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: "var(--text-primary)" }}
                />
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-4 flex items-center justify-end gap-4"
          style={{ background: "var(--sidebar-bg)" }}
        >
          <button
            onClick={onClose}
            className="text-sm font-medium hover:underline transition-all"
            style={{ color: "var(--text-primary)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || loading}
            className="px-6 py-2 rounded text-sm font-semibold text-white transition-colors disabled:opacity-50"
            style={{ background: "var(--primary)" }}
          >
            Create Channel
          </button>
        </div>
      </div>
    </div>
  );
}
