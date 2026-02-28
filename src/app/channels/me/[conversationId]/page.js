import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import ChatMessages from "@/components/chat/chat-messages";
import {
  AtSign,
  Phone,
  Video,
  Pin,
  UserPlus,
  Inbox,
  HelpCircle,
  Search,
} from "lucide-react";

import MobileToggle from "@/components/layout/mobile-toggle";
export default async function DMPage({ params }) {
  const { userId } = await auth();
  const { conversationId } = await params;
  const supabase = getSupabaseAdmin();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  const { data: conversation } = await supabase
    .from("conversations")
    .select(
      `*, member_one:profiles!conversations_member_one_id_fkey(*), member_two:profiles!conversations_member_two_id_fkey(*)`,
    )
    .eq("id", conversationId)
    .single();

  const otherMember =
    conversation.member_one_id === profile.id
      ? conversation.member_two
      : conversation.member_one;

  const { data: messages } = await supabase
    .from("direct_messages")
    .select("*, profile:profiles(*)")
    .eq("conversation_id", conversationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(50);

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* DM Header */}
      <div
        className="flex h-12 shrink-0 items-center justify-between px-4 border-b"
        style={{
          borderColor: "var(--border)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
        }}
      >
        <div className="flex items-center gap-3">
          <MobileToggle />
          <div className="relative w-7 h-7">
            {otherMember?.avatar_url ? (
              <img
                src={otherMember.avatar_url}
                className="w-7 h-7 rounded-full"
                alt="avatar"
              />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-xs"
                style={{ background: "var(--primary)" }}
              >
                {otherMember?.display_name?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[var(--sidebar-bg)] bg-[var(--success)]" />
          </div>
          <span
            className="font-semibold text-sm"
            style={{ color: "var(--text-primary)" }}
          >
            {otherMember?.display_name ?? otherMember?.username}
          </span>
        </div>

        <div
          className="flex items-center gap-2"
          style={{ color: "var(--text-secondary)" }}
        >
          {[Phone, Video, Pin, UserPlus, Inbox, HelpCircle].map((Icon, i) => (
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

      <ChatMessages
        conversationId={conversationId}
        currentProfileId={profile?.id}
        initialMessages={messages ?? []}
      />
    </div>
  );
}
