"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

export default function RealtimeNotifications({
  profileId,
  initialConversations = [],
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const pathname = usePathname();
  const supabase = getSupabaseClient();

  useEffect(() => {
    if (!profileId) return;

    // We trust initialConversations from server-side.
    // Only attempt client-side fetch if for some reason it's strictly undefined.
    if (initialConversations === undefined) {
      supabase
        .from("conversations")
        .select("id")
        .or(`member_one_id.eq.${profileId},member_two_id.eq.${profileId}`)
        .then(({ data, error }) => {
          if (error) {
            console.error("[CONVERSATION_FETCH_ERROR]", error);
            return;
          }
          if (data) setConversations(data);
        });
    }

    // Listen for new friend requests
    const friendReqChannel = supabase
      .channel("friend_req_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "friend_requests",
          filter: `receiver_id=eq.${profileId}`,
        },
        async (payload) => {
          try {
            const { data: sender } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", payload.new.sender_id)
              .single();

            if (sender) {
              toast.success(
                `New friend request from ${sender.display_name || sender.username}`,
              );
            }
          } catch (e) {
            console.error("[FRIEND_REQ_FETCH_ERROR]", e);
          }
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error(
            "[WS_ERROR] Friend Req channel failed. Check network/VPN.",
          );
        }
      });

    // Listen to new conversations where user is a participant
    const newConvChannel = supabase
      .channel("new_conversations")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversations",
        },
        (payload) => {
          const isParticipant =
            payload.new.member_one_id === profileId ||
            payload.new.member_two_id === profileId;
          if (isParticipant) {
            setConversations((prev) => {
              if (prev.some((c) => c.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(friendReqChannel);
      supabase.removeChannel(newConvChannel);
    };
  }, [profileId, supabase, initialConversations]);

  useEffect(() => {
    if (!profileId || conversations.length === 0) return;

    // Join all conversations IDs
    const convoIds = conversations.map((c) => c.id);
    const filter = `conversation_id=in.(${convoIds.join(",")})`;

    // Listen for new DMs
    const dmChannel = supabase
      .channel("dm_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter,
        },
        async (payload) => {
          const message = payload.new;
          if (message.profile_id === profileId) return;
          if (pathname.includes(`/channels/@me/${message.conversation_id}`))
            return;

          try {
            const { data: sender } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", message.profile_id)
              .single();

            if (sender) {
              toast(
                `New message from ${sender.display_name || sender.username}`,
                {
                  description: message.content || "Sent an attachment",
                },
              );
            }
          } catch (e) {
            console.error("[DM_NOTIF_ERROR]", e);
          }
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error(
            "[WS_ERROR] DM Notifications failed. Check network/VPN.",
          );
        }
      });

    return () => {
      supabase.removeChannel(dmChannel);
    };
  }, [profileId, conversations, pathname, supabase]);

  return null;
}
