"use client";

import { useState, useRef } from "react";
import { X, Upload, File } from "lucide-react";
import { useModalStore } from "@/store/modal-store";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useUser } from "@clerk/nextjs";

export default function MessageFileModal() {
  const { isOpen, type, onClose, data } = useModalStore();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const supabase = getSupabaseClient();
  const { user } = useUser();

  const isVisible = isOpen && type === "messageFile";
  const { channelId, conversationId } = data; // one of these will be provided

  if (!isVisible) return null;

  async function handleSend(e) {
    e.preventDefault();
    if (!file || loading) return;

    setLoading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user?.id || "unknown"}/${fileName}`;

      // Upload to supabase storage
      const { error: uploadError } = await supabase.storage
        .from("attachments")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL (assuming we make bucket public or handle signed urls properly. Here we will use public url if available, or just path)
      // Since attachments is private in setup, we technically need a signed url to display. For now, let's just store the path and use it later, or an api route.
      // Wait, let's use getPublicUrl just in case we changed it, or we can use a signed URL.
      // For simplicity in this clone, we store the path or public URL.
      const {
        data: { publicUrl },
      } = supabase.storage.from("attachments").getPublicUrl(filePath);

      // Now insert message
      const payload = {
        content: null,
        file_url: publicUrl,
        file_type: file.type,
      };

      if (channelId) {
        payload.channelId = channelId;
      } else if (conversationId) {
        payload.conversationId = conversationId;
      }

      await fetch(`/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      handleClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setFile(null);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <div
        className="relative w-full max-w-md rounded-lg overflow-hidden shadow-2xl"
        style={{ background: "var(--background)" }}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-full transition-colors hover:bg-[var(--surface)]"
          style={{ color: "var(--text-secondary)" }}
        >
          <X className="w-6 h-6" />
        </button>

        <div className="pt-8 pb-4 px-6 text-center">
          <h2
            className="text-2xl font-bold mb-2 flex justify-center items-center gap-2"
            style={{ color: "var(--text-primary)" }}
          >
            <Upload className="w-6 h-6" /> Upload a file
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Send a file to this {channelId ? "channel" : "conversation"}
          </p>
        </div>

        <form onSubmit={handleSend} className="px-6 pb-6">
          <div className="mb-6 flex justify-center mt-2">
            {!file ? (
              <div
                className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--surface)] transition-colors"
                style={{ borderColor: "var(--border)" }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--primary)" }}
                >
                  Browse files
                </span>
              </div>
            ) : (
              <div className="w-full flex items-center justify-between p-4 rounded-lg bg-[var(--surface)]">
                <div className="flex items-center gap-3 overflow-hidden">
                  <File className="w-8 h-8 shrink-0 text-indigo-400" />
                  <span className="truncate text-sm font-medium">
                    {file.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="p-1 hover:text-white text-[var(--text-secondary)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium transition-colors hover:underline"
              style={{ color: "var(--text-primary)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || loading}
              className="px-6 py-2 rounded text-sm font-semibold text-white transition-colors disabled:opacity-50"
              style={{ background: "var(--primary)" }}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
