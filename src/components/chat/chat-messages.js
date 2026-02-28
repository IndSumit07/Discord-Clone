"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { formatDate, formatMessageTime } from "@/lib/utils";
import {
  Hash,
  Smile,
  Plus,
  Gift,
  Sticker,
  Edit2,
  Trash2,
  FileIcon,
} from "lucide-react";
import { useModalStore } from "@/store/modal-store";

function MessageItem({ message, currentProfileId, onEdit, onDelete }) {
  const [hovering, setHovering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content || "");
  const [loading, setLoading] = useState(false);

  const isOwn = message.profile_id === currentProfileId;

  // Sync edit content when message changes externally
  useEffect(() => {
    setEditContent(message.content || "");
  }, [message.content]);

  // Handle ESC globally when editing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isEditing) {
        setIsEditing(false);
        setEditContent(message.content);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditing, message.content]);

  async function handleEdit(e) {
    if (e) e.preventDefault();
    if (!editContent.trim() || editContent === message.content) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    const newContent = editContent.trim();
    // Optimistic update
    onEdit(message.id, newContent);
    setIsEditing(false);

    try {
      await fetch(`/api/messages/${message.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent }),
      });
    } catch (err) {
      console.error(err);
      // Revert on error
      onEdit(message.id, message.content);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    // Optimistic delete
    onDelete(message.id);
    try {
      await fetch(`/api/messages/${message.id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div
      className="group relative flex items-start gap-4 px-4 py-1 hover:bg-white/5 transition-colors rounded"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Avatar */}
      <div className="mt-0.5 shrink-0">
        {message.profile?.avatar_url ? (
          <img
            src={message.profile.avatar_url}
            className="w-10 h-10 rounded-full"
            alt={message.profile.username}
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white"
            style={{ background: "var(--primary)" }}
          >
            {message.profile?.display_name?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span
            className="font-semibold text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            {message.profile?.display_name ??
              message.profile?.username ??
              "Unknown"}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {formatDate(message.created_at)}
          </span>
          {message.is_edited && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              (edited)
            </span>
          )}
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-2 w-full mt-1">
            <form onSubmit={handleEdit} className="flex-1">
              <input
                autoFocus
                disabled={loading}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full text-sm rounded px-3 py-2 outline-none"
                style={{
                  background: "var(--input-bg)",
                  color: "var(--text-primary)",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsEditing(false);
                    setEditContent(message.content);
                  }
                }}
              />
            </form>
            <span
              className="text-[11px]"
              style={{ color: "var(--text-muted)" }}
            >
              escape to{" "}
              <span
                className="text-blue-400 cursor-pointer hover:underline"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(message.content);
                }}
              >
                cancel
              </span>{" "}
              • enter to{" "}
              <span
                className="text-blue-400 cursor-pointer hover:underline"
                onClick={handleEdit}
              >
                save
              </span>
            </span>
          </div>
        ) : message.deleted_at ? (
          <p className="italic text-sm" style={{ color: "var(--text-muted)" }}>
            Message was deleted.
          </p>
        ) : (
          <>
            {message.content && (
              <p
                className="text-sm break-words whitespace-pre-wrap mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                {message.content}
              </p>
            )}
            {message.file_url && (
              <div
                className="mt-2 rounded-lg overflow-hidden border max-w-sm inline-block"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--surface)",
                }}
              >
                {message.file_type?.startsWith("image/") ? (
                  <img
                    src={message.file_url}
                    alt="attachment"
                    className="w-full h-auto object-cover max-h-72"
                  />
                ) : (
                  <a
                    href={message.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    <FileIcon className="w-8 h-8 text-indigo-400 shrink-0" />
                    <span className="text-sm font-medium truncate text-blue-400 hover:underline">
                      Download Attachment
                    </span>
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Hover Actions */}
      {hovering && !message.deleted_at && !isEditing && (
        <div
          className="absolute right-4 top-0 -translate-y-1/2 flex items-center gap-1 rounded px-2 py-1 shadow-lg border"
          style={{
            background: "var(--sidebar-bg)",
            borderColor: "var(--border)",
          }}
        >
          <button
            className="p-1.5 rounded hover:bg-[var(--surface)] transition-colors"
            title="React"
          >
            <Smile
              className="w-4 h-4"
              style={{ color: "var(--text-secondary)" }}
            />
          </button>
          {isOwn && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded hover:bg-[var(--surface)] transition-colors"
              title="Edit"
            >
              <Edit2
                className="w-4 h-4"
                style={{ color: "var(--text-secondary)" }}
              />
            </button>
          )}
          {isOwn && (
            <button
              onClick={handleDelete}
              className="p-1.5 rounded hover:bg-[var(--surface)] transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" style={{ color: "var(--danger)" }} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DateDivider({ date }) {
  return (
    <div className="flex items-center gap-4 px-4 py-2 mt-4">
      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
      <span
        className="text-xs font-semibold px-2"
        style={{ color: "var(--text-muted)" }}
      >
        {date}
      </span>
      <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
    </div>
  );
}

export default function ChatMessages({
  channelId,
  conversationId,
  currentProfileId,
  initialMessages = [],
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const supabase = getSupabaseClient();
  const { onOpen } = useModalStore();

  const isDM = !!conversationId;
  const table = isDM ? "direct_messages" : "messages";
  const filterCol = isDM ? "conversation_id" : "channel_id";
  const filterVal = isDM ? conversationId : channelId;

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const channel = supabase
      .channel(`chat-${filterVal}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: table,
          filter: `${filterCol}=eq.${filterVal}`,
        },
        async (payload) => {
          // Fetch the full message with profile
          const { data } = await supabase
            .from(table)
            .select("*, profile:profiles(*)")
            .eq("id", payload.new.id)
            .single();
          if (data) setMessages((prev) => [...prev, data]);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: table,
          filter: `${filterCol}=eq.${filterVal}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === payload.new.id ? { ...m, ...payload.new } : m,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filterVal, table, filterCol]);

  const sendMessage = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!input.trim() || sending) return;
      setSending(true);
      const content = input.trim();
      setInput("");

      try {
        await fetch(`/api/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isDM ? { conversationId, content } : { channelId, content },
          ),
        });
      } catch (err) {
        console.error(err);
      } finally {
        setSending(false);
      }
    },
    [input, channelId, conversationId, sending, isDM],
  );

  const handleEditMessage = useCallback((id, newContent) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, content: newContent, is_edited: true } : m,
      ),
    );
  }, []);

  const handleDeleteMessage = useCallback((id) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, deleted_at: new Date().toISOString() } : m,
      ),
    );
  }, []);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto flex flex-col justify-end">
        <div className="min-h-0">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center px-8">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: "var(--surface)" }}
              >
                <Hash
                  className="w-10 h-10"
                  style={{ color: "var(--text-muted)" }}
                />
              </div>
              <h3
                className="text-2xl font-bold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Welcome to the channel!
              </h3>
              <p style={{ color: "var(--text-muted)" }}>
                This is the beginning of the channel history.
              </p>
            </div>
          )}

          {messages.map((message, i) => {
            const prev = messages[i - 1];
            const currDate = formatDate(message.created_at);
            const prevDate = prev ? formatDate(prev.created_at) : null;
            const showDivider = currDate !== prevDate;

            return (
              <div key={message.id}>
                {showDivider && <DateDivider date={currDate} />}
                <MessageItem
                  message={message}
                  currentProfileId={currentProfileId}
                  onEdit={handleEditMessage}
                  onDelete={handleDeleteMessage}
                />
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="px-4 pb-6 pt-2 shrink-0">
        <form onSubmit={sendMessage}>
          <div
            className="flex items-center gap-2 rounded-lg pl-4"
            style={{ background: "var(--surface)" }}
          >
            {/* Attachment */}
            <button
              type="button"
              onClick={() =>
                onOpen("messageFile", { channelId, conversationId })
              }
              className="p-2 shrink-0 rounded transition-colors hover:bg-[var(--surface-hover)]"
            >
              <Plus
                className="w-5 h-5"
                style={{ color: "var(--text-secondary)" }}
              />
            </button>

            {/* Input */}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) sendMessage(e);
              }}
              placeholder="Message #channel"
              className="flex-1 bg-transparent py-3 text-sm outline-none"
              style={{ color: "var(--text-primary)" }}
              disabled={sending}
            />

            {/* Action buttons */}
            <div className="flex items-center pr-2 gap-1">
              <button
                type="button"
                className="p-2 rounded transition-colors hover:bg-[var(--surface-hover)]"
              >
                <Gift
                  className="w-5 h-5"
                  style={{ color: "var(--text-secondary)" }}
                />
              </button>
              <button
                type="button"
                className="p-2 rounded transition-colors hover:bg-[var(--surface-hover)]"
              >
                <Sticker
                  className="w-5 h-5"
                  style={{ color: "var(--text-secondary)" }}
                />
              </button>
              <button
                type="button"
                className="p-2 rounded transition-colors hover:bg-[var(--surface-hover)]"
              >
                <Smile
                  className="w-5 h-5"
                  style={{ color: "var(--text-secondary)" }}
                />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
