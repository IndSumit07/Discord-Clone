import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import ChatMessages from "@/components/chat/chat-messages";
import {
  Hash,
  Bell,
  Pin,
  Users,
  HelpCircle,
  Inbox,
  Search,
} from "lucide-react";

import MobileToggle from "@/components/layout/mobile-toggle";
import VideoRoom from "@/components/chat/video-room";

export default async function ChannelPage({ params }) {
  const { userId } = await auth();
  const { channelId } = await params;
  const supabase = getSupabaseAdmin();

  // Get current profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_id", userId)
    .single();

  // Get channel info
  const { data: channel } = await supabase
    .from("channels")
    .select("*")
    .eq("id", channelId)
    .single();

  // Fetch initial messages (last 50) for text channels only
  let messages = [];
  if (channel?.type === "text") {
    const { data } = await supabase
      .from("messages")
      .select("*, profile:profiles(*)")
      .eq("channel_id", channelId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(50);
    messages = data;
  }

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Channel Header */}
      <div
        className="flex h-12 shrink-0 items-center justify-between px-4 border-b"
        style={{
          borderColor: "var(--border)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
        }}
      >
        <div className="flex items-center gap-2">
          <MobileToggle />
          <Hash
            className="w-5 h-5 shrink-0 hidden md:block"
            style={{ color: "var(--text-muted)" }}
          />
          <span
            className="font-semibold text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            {channel?.name ?? "channel"}
          </span>
          {channel?.topic && (
            <>
              <div
                className="w-px h-5 mx-2"
                style={{ background: "var(--border)" }}
              />
              <span
                className="text-sm truncate max-w-xs"
                style={{ color: "var(--text-muted)" }}
              >
                {channel.topic}
              </span>
            </>
          )}
        </div>

        {/* Right icons */}
        <div
          className="flex items-center gap-2"
          style={{ color: "var(--text-secondary)" }}
        >
          {[Bell, Pin, Users, HelpCircle, Inbox].map((Icon, i) => (
            <button
              key={i}
              className="p-1.5 rounded transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
            >
              <Icon className="w-5 h-5" />
            </button>
          ))}
          <div
            className="flex items-center gap-1.5 rounded px-1.5 py-1 cursor-text ml-1"
            style={{ background: "var(--input-bg)", width: "136px" }}
          >
            <span
              className="text-sm flex-1"
              style={{ color: "var(--text-muted)" }}
            >
              Search
            </span>
            <Search
              className="w-4 h-4 shrink-0"
              style={{ color: "var(--text-muted)" }}
            />
          </div>
        </div>
      </div>

      {channel?.type === "text" && (
        <ChatMessages
          channelId={channelId}
          currentProfile={profile}
          initialMessages={messages ?? []}
        />
      )}
      {channel?.type === "voice" && (
        <VideoRoom chatId={channel.id} video={false} audio={true} />
      )}
      {channel?.type === "video" && (
        <VideoRoom chatId={channel.id} video={true} audio={true} />
      )}
    </div>
  );
}
