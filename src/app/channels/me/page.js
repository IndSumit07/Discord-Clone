import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import FriendsClient from "./friends-client";

export default async function FriendsPage() {
  const { userId } = await auth();
  const supabase = getSupabaseAdmin();

  // Get current profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_id", userId)
    .single();

  if (!profile) return null;

  // Get friends
  const { data: friendsData } = await supabase
    .from("friends")
    .select(
      `*, profile_one:profiles!friends_profile_one_id_fkey(*), profile_two:profiles!friends_profile_two_id_fkey(*)`,
    )
    .or(`profile_one_id.eq.${profile.id},profile_two_id.eq.${profile.id}`);

  // Get pending requests
  const { data: requestsData } = await supabase
    .from("friend_requests")
    .select(
      `*, sender:profiles!friend_requests_sender_id_fkey(*), receiver:profiles!friend_requests_receiver_id_fkey(*)`,
    )
    .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
    .eq("status", "pending");

  return (
    <FriendsClient
      profile={profile}
      initialFriends={friendsData || []}
      initialRequests={requestsData || []}
    />
  );
}
