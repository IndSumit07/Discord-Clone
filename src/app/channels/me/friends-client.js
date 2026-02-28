"use client";

import { useState, useEffect } from "react";
import { Users, Check, X } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { formatMessageTime } from "@/lib/utils";
import { useRouter } from "next/navigation";
import MobileToggle from "@/components/layout/mobile-toggle";

const TABS = [
  { id: "online", label: "Online" },
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "blocked", label: "Blocked" },
  { id: "add", label: "Add Friend", isAction: true },
];

function EmptyState({ tab }) {
  const messages = {
    online: {
      icon: "🎮",
      title: "No one's around to play with Wumpus.",
      sub: "They're all probably somewhere doing something.",
    },
    all: {
      icon: "👥",
      title: "No friends yet.",
      sub: "They're still around though, maybe.",
    },
    pending: {
      icon: "📨",
      title: "There are no pending friend requests.",
      sub: "Here's Wumpus for company.",
    },
    blocked: {
      icon: "🚫",
      title: "You haven't blocked anyone.",
      sub: "It's a good thing — unless it isn't.",
    },
  };
  const m = messages[tab] ?? messages.online;
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-20 text-center">
      <div className="text-6xl mb-6">{m.icon}</div>
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: "var(--text-primary)" }}
      >
        {m.title}
      </h3>
      <p className="text-sm max-w-xs" style={{ color: "var(--text-muted)" }}>
        {m.sub}
      </p>
    </div>
  );
}

export default function FriendsClient({
  profile,
  initialFriends,
  initialRequests,
}) {
  const [activeTab, setActiveTab] = useState("online");
  const [addFriendInput, setAddFriendInput] = useState("");
  const [addStatus, setAddStatus] = useState({ type: "", msg: "" });
  const [friends, setFriends] = useState(initialFriends);
  const [requests, setRequests] = useState(initialRequests);
  const supabase = getSupabaseClient();
  const router = useRouter();

  // Realtime
  useEffect(() => {
    const fnChannel = supabase
      .channel("friends_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friend_requests",
          filter: `receiver_id=eq.${profile.id}`,
        },
        () => router.refresh(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friend_requests",
          filter: `sender_id=eq.${profile.id}`,
        },
        () => router.refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "friends" },
        () => router.refresh(),
      )
      .subscribe();
    return () => supabase.removeChannel(fnChannel);
  }, [profile.id, router, supabase]);

  useEffect(() => {
    setFriends(initialFriends);
    setRequests(initialRequests);
  }, [initialFriends, initialRequests]);

  async function handleAdd() {
    if (!addFriendInput.trim()) return;
    try {
      setAddStatus({ type: "", msg: "" });
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetEmail: addFriendInput }),
      });
      if (res.ok) {
        setAddStatus({
          type: "success",
          msg:
            "Success! Your friend request to " + addFriendInput + " was sent.",
        });
        setAddFriendInput("");
        router.refresh();
      } else {
        const text = await res.text();
        setAddStatus({ type: "error", msg: text || "Adding friend failed." });
      }
    } catch (err) {
      setAddStatus({ type: "error", msg: "Failed to send request." });
    }
  }

  async function handleRespond(requestId, action) {
    try {
      await fetch("/api/friends/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      router.refresh(); // Server component fetches new data
    } catch (e) {}
  }

  const pendingIncoming = requests.filter((r) => r.receiver_id === profile.id);
  const pendingOutgoing = requests.filter((r) => r.sender_id === profile.id);

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--background)" }}
    >
      {/* Top Bar */}
      <div
        className="flex h-12 shrink-0 items-center gap-2 px-4 border-b"
        style={{
          borderColor: "var(--border)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
        }}
      >
        <div
          className="flex items-center gap-2 pr-4 border-r"
          style={{ borderColor: "var(--border)" }}
        >
          <MobileToggle />
          <Users
            className="w-5 h-5 hidden md:block"
            style={{ color: "var(--text-secondary)" }}
          />
          <span
            className="font-semibold text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            Friends
          </span>
        </div>

        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-3 py-1 rounded text-sm font-medium transition-colors"
            style={{
              background:
                activeTab === tab.id ? "var(--surface)" : "transparent",
              color: tab.isAction
                ? activeTab === "add"
                  ? "white"
                  : "var(--success)"
                : activeTab === tab.id
                  ? "var(--text-primary)"
                  : "var(--text-muted)",
              ...(tab.isAction &&
                activeTab === "add" && { background: "var(--success)" }),
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id && !tab.isAction)
                e.currentTarget.style.background = "var(--surface-hover)";
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id && !tab.isAction)
                e.currentTarget.style.background = "transparent";
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "add" ? (
        <div
          className="flex-1 p-8 max-w-2xl border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Add Friend
          </h2>
          <p
            className="text-sm mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            You can add friends with their email address.
          </p>
          <div className="flex flex-col gap-2">
            <div
              className={`flex items-center gap-3 rounded-lg p-1 pr-2 border ${addStatus.type === "success" ? "border-[var(--success)]" : addStatus.type === "error" ? "border-[var(--danger)]" : "border-[var(--border)]"}`}
              style={{ background: "var(--input-bg)" }}
            >
              <input
                type="text"
                placeholder="You can add friends with their email address."
                value={addFriendInput}
                onChange={(e) => setAddFriendInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
                style={{ color: "var(--text-primary)" }}
              />
              <button
                onClick={handleAdd}
                disabled={!addFriendInput}
                className="px-4 py-1.5 rounded text-sm font-semibold text-white transition-colors disabled:opacity-50"
                style={{ background: "var(--primary)" }}
              >
                Send Friend Request
              </button>
            </div>
            {addStatus.msg && (
              <p
                className="text-xs px-2"
                style={{
                  color:
                    addStatus.type === "success"
                      ? "var(--success)"
                      : "var(--danger)",
                }}
              >
                {addStatus.msg}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* List Area */}
          <div className="flex-1 flex flex-col overflow-y-auto p-4">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search"
                className="w-full rounded px-3 py-1.5 pr-8 text-sm outline-none border border-transparent focus:border-[var(--primary)]"
                style={{
                  background: "var(--input-bg)",
                  color: "var(--text-primary)",
                }}
              />
              <svg
                className="absolute right-3 top-2 w-4 h-4"
                style={{ color: "var(--text-muted)" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {activeTab === "pending" && requests.length > 0 && (
              <>
                <p
                  className="text-xs font-semibold uppercase mb-3"
                  style={{ color: "var(--text-muted)" }}
                >
                  Pending — {requests.length}
                </p>
                {requests.map((req) => {
                  const isIncoming = req.receiver_id === profile.id;
                  const otherUser = isIncoming ? req.sender : req.receiver;
                  return (
                    <div
                      key={req.id}
                      className="flex items-center justify-between p-3 rounded group hover:bg-[var(--surface-hover)] border-t border-[var(--border)] cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xs overflow-hidden">
                          {otherUser?.avatar_url ? (
                            <img
                              src={otherUser.avatar_url}
                              alt="av"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            otherUser?.username?.[0]?.toUpperCase()
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span
                            className="font-semibold text-sm"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {otherUser?.display_name || otherUser?.username}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {isIncoming
                              ? "Incoming Friend Request"
                              : "Outgoing Friend Request"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isIncoming && (
                          <button
                            onClick={() => handleRespond(req.id, "accept")}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--surface)] hover:text-[var(--success)] transition-colors"
                            style={{ color: "var(--text-muted)" }}
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleRespond(req.id, "reject")}
                          className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--surface)] hover:text-[var(--danger)] transition-colors"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {activeTab === "all" && friends.length > 0 && (
              <>
                <p
                  className="text-xs font-semibold uppercase mb-3"
                  style={{ color: "var(--text-muted)" }}
                >
                  All Friends — {friends.length}
                </p>
                {friends.map((f) => {
                  const friend =
                    f.profile_one_id === profile.id
                      ? f.profile_two
                      : f.profile_one;
                  return (
                    <div
                      key={f.id}
                      className="flex items-center justify-between p-3 rounded group hover:bg-[var(--surface-hover)] border-t border-[var(--border)] cursor-pointer"
                      onClick={() => router.push(`/channels/@me/${f.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8">
                          <div className="w-full h-full rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xs overflow-hidden">
                            {friend?.avatar_url ? (
                              <img
                                src={friend.avatar_url}
                                alt="av"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              friend?.username?.[0]?.toUpperCase()
                            )}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--background)] bg-[var(--text-muted)] group-hover:border-[var(--surface-hover)] transition-colors" />
                        </div>
                        <div className="flex flex-col">
                          <span
                            className="font-semibold text-sm flex items-center gap-1"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {friend?.display_name || friend?.username}
                            <span
                              className="hidden group-hover:inline text-xs"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {friend?.username}
                            </span>
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Offline
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Empty States */}
            {((activeTab === "pending" && requests.length === 0) ||
              (activeTab === "all" && friends.length === 0) ||
              activeTab === "online" ||
              activeTab === "blocked") && <EmptyState tab={activeTab} />}
          </div>

          {/* Active Now Sidebar */}
          <div
            className="w-80 shrink-0 border-l flex flex-col p-4"
            style={{ borderColor: "var(--border)" }}
          >
            <h3
              className="text-xl font-bold mb-5"
              style={{ color: "var(--text-primary)" }}
            >
              Active Now
            </h3>
            <div className="flex flex-col items-center justify-center flex-1 text-center py-10">
              <div className="text-5xl mb-4">🎮</div>
              <h4
                className="font-bold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                It's quiet for now...
              </h4>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                When a friend starts an activity—like playing a game or hanging
                out on voice—we'll show it here!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
