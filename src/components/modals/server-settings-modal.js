"use client";

import { useState, useRef, useEffect } from "react";
import { X, Upload, Trash2 } from "lucide-react";
import { useModalStore } from "@/store/modal-store";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function ServerSettingsModal() {
  const { isOpen, type, onClose, data } = useModalStore();
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const supabase = getSupabaseClient();

  const isVisible = isOpen && type === "serverSettings";
  const { server } = data;

  useEffect(() => {
    if (server) {
      setName(server.name);
      setPreviewUrl(server.icon_url || "");
    }
  }, [server]);

  if (!isVisible) return null;

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    try {
      let iconUrl = server.icon_url;

      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${server.id}-${Date.now()}.${fileExt}`;
        const filePath = `${server.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("server-icons")
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage
          .from("server-icons")
          .getPublicUrl(filePath);

        iconUrl = publicData.publicUrl;
      }

      await fetch(`/api/servers/${server.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, icon_url: iconUrl }),
      });

      onClose();
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    const confirmDelete = confirm(
      "Are you sure you want to delete this server? This action cannot be undone.",
    );
    if (!confirmDelete) return;

    setLoading(true);
    try {
      await fetch(`/api/servers/${server.id}`, {
        method: "DELETE",
      });
      onClose();
      window.location.href = "/channels/@me";
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const objectUrl = URL.createObjectURL(selected);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <div
        className="relative w-full max-w-xl rounded-lg overflow-hidden shadow-2xl flex"
        style={{ background: "#313338", height: "500px" }}
      >
        {/* Left Sidebar */}
        <div
          className="w-1/3 p-6 flex flex-col justify-between"
          style={{ background: "var(--sidebar-bg)" }}
        >
          <div>
            <div
              className="text-xs font-bold uppercase mb-4"
              style={{ color: "var(--text-muted)" }}
            >
              {server?.name}
            </div>
            <button className="w-full text-left px-2 py-1.5 rounded transition-colors text-sm font-semibold mb-1 hover:bg-[var(--surface)] text-white">
              Overview
            </button>
            <div
              className="w-full h-px my-2"
              style={{ background: "var(--border)" }}
            />
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-between text-left px-2 py-1.5 rounded transition-colors text-sm font-semibold hover:bg-[var(--danger)] hover:text-white"
              style={{ color: "var(--danger)" }}
            >
              Delete Server <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="w-2/3 p-8 flex flex-col relative overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full border-2 transition-colors hover:bg-[var(--surface-hover)]"
            style={{
              color: "var(--text-secondary)",
              borderColor: "var(--border)",
            }}
          >
            <X className="w-5 h-5" />
          </button>

          <h2
            className="text-xl font-bold mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Server Overview
          </h2>

          <div className="flex gap-6 mb-6">
            <div
              className="w-24 h-24 rounded-full border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors relative overflow-hidden group shrink-0"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-muted)",
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    className="w-full h-full object-cover"
                    alt="Preview"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                    CHANGE
                  </div>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6" />
                  <span className="text-[10px] font-medium uppercase">
                    Upload
                  </span>
                </>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="flex-1">
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
                className="w-full rounded px-3 py-2.5 text-sm outline-none"
                style={{
                  background: "var(--input-bg)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                }}
              />
            </div>
          </div>

          <div
            className="mt-auto pt-6 border-t flex justify-end"
            style={{ borderColor: "var(--border)" }}
          >
            <button
              onClick={handleSave}
              disabled={loading || !name.trim()}
              className="px-6 py-2 rounded text-sm font-semibold text-white transition-colors disabled:opacity-50"
              style={{
                background: loading ? "var(--primary-hover)" : "var(--primary)",
              }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
