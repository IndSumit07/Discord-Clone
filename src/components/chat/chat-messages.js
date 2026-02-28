"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import {
  Hash,
  Smile,
  Plus,
  Gift,
  Sticker,
  Edit2,
  Trash2,
  FileIcon,
  Loader2,
} from "lucide-react";
import { useModalStore } from "@/store/modal-store";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function MessageSkeleton() {
  return (
    <div className="flex items-start gap-4 px-4 py-2">
      <Skeleton
        circle
        width={40}
        height={40}
        baseColor="#2b2d31"
        highlightColor="#313338"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Skeleton
            width={100}
            height={14}
            baseColor="#2b2d31"
            highlightColor="#313338"
          />
          <Skeleton
            width={60}
            height={10}
            baseColor="#2b2d31"
            highlightColor="#313338"
          />
        </div>
        <Skeleton
          width="80%"
          height={16}
          baseColor="#2b2d31"
          highlightColor="#313338"
        />
      </div>
    </div>
  );
}

function MessageItem({ message, currentProfile, onEdit, onDelete }) {
  const [hovering, setHovering] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content || "");
  const [loading, setLoading] = useState(false);

  const isOwn = message.profile_id === currentProfile?.id;
  const isOptimistic = message.id.toString().startsWith("temp-");

  useEffect(() => {
    setEditContent(message.content || "");
  }, [message.content]);

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
      onEdit(message.id, message.content);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
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
      className={`group relative flex items-start gap-4 px-4 py-[2px] transition-colors rounded ${
        isOptimistic ? "opacity-50" : "hover:bg-white/5"
      }`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="mt-1 shrink-0">
        {message.profile?.avatar_url ? (
          <img
            src={message.profile.avatar_url}
            className="w-10 h-10 rounded-full"
            alt={message.profile?.username || "avatar"}
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

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span
            className="font-semibold text-sm hover:underline cursor-pointer"
            style={{ color: "var(--text-primary)" }}
          >
            {message.profile?.display_name ??
              message.profile?.username ??
              "Unknown"}
          </span>
          <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {formatDate(message.created_at)}
          </span>
          {message.is_edited && !message.deleted_at && (
            <span
              className="text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              (edited)
            </span>
          )}
          {isOptimistic && (
            <Loader2
              className="w-3 h-3 animate-spin"
              style={{ color: "var(--text-muted)" }}
            />
          )}
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-1 w-full mt-1">
            <form onSubmit={handleEdit} className="flex-1">
              <input
                autoFocus
                disabled={loading}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full text-sm rounded-md px-3 py-2 outline-none border-none"
                style={{
                  background: "var(--input-bg)",
                  color: "var(--text-primary)",
                }}
              />
            </form>
            <span
              className="text-[11px]"
              style={{ color: "var(--text-muted)" }}
            >
              escape to{" "}
              <button
                onClick={() => setIsEditing(false)}
                className="text-[#00a8fc] hover:underline"
              >
                cancel
              </button>{" "}
              • enter to{" "}
              <button
                onClick={handleEdit}
                className="text-[#00a8fc] hover:underline"
              >
                save
              </button>
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
                className="text-sm break-words whitespace-pre-wrap leading-5"
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
                    className="w-full h-auto object-cover max-h-[350px]"
                  />
                ) : (
                  <a
                    href={message.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    <FileIcon className="w-8 h-8 text-[#00a8fc] shrink-0" />
                    <span className="text-sm font-medium truncate text-[#00a8fc] hover:underline">
                      Download Attachment
                    </span>
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {hovering && !message.deleted_at && !isEditing && !isOptimistic && (
        <div
          className="absolute -right-1 top-0 -translate-y-1/2 flex items-center gap-1 rounded px-1.5 py-0.5 shadow-lg border bg-[#2b2d31]"
          style={{ borderColor: "var(--border)" }}
        >
          <button className="p-1.5 rounded hover:bg-[#3f4147] transition-colors">
            <Smile className="w-4 h-4 text-[#b5bac1]" />
          </button>
          {isOwn && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded hover:bg-[#3f4147] transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4 text-[#b5bac1]" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 rounded hover:bg-[#3f4147] transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4 text-[#f23f42]" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function DateDivider({ date }) {
  return (
    <div className="flex items-center gap-4 px-4 py-2 mt-4 relative">
      <div className="flex-1 h-px bg-[#3f4147]" />
      <span
        className="text-[11px] font-bold px-1 relative z-10"
        style={{ color: "#949ba4" }}
      >
        {date}
      </span>
      <div className="flex-1 h-px bg-[#3f4147]" />
    </div>
  );
}

export default function ChatMessages({
  channelId,
  conversationId,
  currentProfile,
  initialMessages = [],
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(initialMessages.length === 0);

  const bottomRef = useRef(null);
  const supabase = useMemo(() => getSupabaseClient(), []);
  const { onOpen } = useModalStore();

  // Sync messages state when switching channels/conversations
  useEffect(() => {
    setMessages(initialMessages);
    setLoading(false);
  }, [initialMessages, channelId, conversationId]);

  const isDM = !!conversationId;
  const table = isDM ? "direct_messages" : "messages";
  const filterCol = isDM ? "conversation_id" : "channel_id";
  const filterVal = isDM ? conversationId : channelId;

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const chatChannel = supabase
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
          // If the message is from me, it might already be here optimistically
          // We'll replace the optimistic one with the real one
          const { data } = await supabase
            .from(table)
            .select("*, profile:profiles(*)")
            .eq("id", payload.new.id)
            .single();

          if (data) {
            setMessages((prev) => {
              // Check if we have an optimistic message matching this
              // Note: Matching by content/profile is a bit loose, but usually fine for Discord-like feel
              const isMine = data.profile_id === currentProfile?.id;
              if (isMine) {
                const optimisticIdx = prev.findIndex(
                  (m) =>
                    m.id.toString().startsWith("temp-") &&
                    m.content === data.content,
                );
                if (optimisticIdx !== -1) {
                  const next = [...prev];
                  next[optimisticIdx] = data;
                  return next;
                }
              }
              // Deduplicate ID just in case
              if (prev.some((m) => m.id === data.id)) return prev;
              return [...prev, data];
            });
          }
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
      supabase.removeChannel(chatChannel);
    };
  }, [filterVal, table, filterCol, currentProfile?.id, supabase]);

  const sendMessage = useCallback(
    async (e) => {
      e?.preventDefault();
      const content = input.trim();
      if (!content) return;

      const tempId = `temp-${Date.now()}`;
      const optimisticMessage = {
        id: tempId,
        content,
        profile_id: currentProfile?.id,
        profile: currentProfile,
        created_at: new Date().toISOString(),
        is_edited: false,
        deleted_at: null,
        file_url: null,
      };

      // Push optimistic
      setMessages((prev) => [...prev, optimisticMessage]);
      setInput("");

      try {
        const res = await fetch(`/api/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isDM ? { conversationId, content } : { channelId, content },
          ),
        });

        if (!res.ok) {
          throw new Error("Failed to send");
        }
      } catch (err) {
        console.error(err);
        // Remove optimistic on absolute failure
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    },
    [input, channelId, conversationId, isDM, currentProfile],
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
      <div className="flex-1 overflow-y-auto flex flex-col scrollbar-custom">
        <div className="mt-auto">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center px-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-[#2b2d31]">
                <Hash className="w-10 h-10 text-[#b5bac1]" />
              </div>
              <h3 className="text-3xl font-bold mb-2 text-white">
                Welcome to #
                {conversationId
                  ? currentProfile?.username
                  : initialMessages[0]?.channel?.name || "channel"}
                !
              </h3>
              <p className="text-[#b5bac1]">
                This is the beginning of the history between you and this
                channel.
              </p>
            </div>
          )}

          {loading
            ? Array(5)
                .fill(0)
                .map((_, i) => <MessageSkeleton key={i} />)
            : messages.map((message, i) => {
                const prev = messages[i - 1];
                const currDate = formatDate(message.created_at);
                const prevDate = prev ? formatDate(prev.created_at) : null;
                const showDivider = currDate !== prevDate;

                return (
                  <div key={message.id}>
                    {showDivider && <DateDivider date={currDate} />}
                    <MessageItem
                      message={message}
                      currentProfile={currentProfile}
                      onEdit={handleEditMessage}
                      onDelete={handleDeleteMessage}
                    />
                  </div>
                );
              })}
          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      <div className="px-4 pb-6 pt-2 shrink-0">
        <form onSubmit={sendMessage}>
          <div className="flex items-center gap-2 rounded-lg pl-4 bg-[#383a40]">
            <button
              type="button"
              onClick={() =>
                onOpen("messageFile", { channelId, conversationId })
              }
              className="p-2 shrink-0 rounded-full transition-colors hover:bg-[#404249]"
            >
              <Plus className="w-5 h-5 text-[#b5bac1]" />
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) sendMessage(e);
              }}
              placeholder={`Message ${isDM ? "@me" : "#channel"}`}
              className="flex-1 bg-transparent py-3 text-sm outline-none text-[#dbdee1]"
            />

            <div className="flex items-center pr-2 gap-1">
              {[Gift, Sticker, Smile].map((Icon, i) => (
                <button
                  key={i}
                  type="button"
                  className="p-2 rounded transition-colors hover:bg-[#404249]"
                >
                  <Icon className="w-5 h-5 text-[#b5bac1]" />
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
