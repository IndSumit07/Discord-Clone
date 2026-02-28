import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { requestId, action } = await req.json(); // action: 'accept' or 'reject'

  const supabase = getSupabaseAdmin();

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!profile) return new Response("Profile not found", { status: 404 });

  // Verify request
  const { data: request } = await supabase
    .from("friend_requests")
    .select("*")
    .eq("id", requestId)
    .eq("receiver_id", profile.id)
    .single();

  if (!request) return new Response("Request not found", { status: 404 });

  if (action === "accept") {
    // 1. Mark request as accepted
    await supabase
      .from("friend_requests")
      .update({ status: "accepted" })
      .eq("id", requestId);

    // 2. Add to friends (ensure profile_one_id < profile_two_id if desired, or just arbitrary)
    // we use arbitrary
    await supabase.from("friends").insert({
      profile_one_id: request.sender_id,
      profile_two_id: profile.id,
    });

    // 3. Create a conversation for DMs
    await supabase.from("conversations").insert({
      member_one_id: request.sender_id,
      member_two_id: profile.id,
    });

    return Response.json({ success: true, message: "Friend added" });
  } else if (action === "reject") {
    await supabase
      .from("friend_requests")
      .update({ status: "rejected" })
      .eq("id", requestId);
    return Response.json({ success: true, message: "Friend rejected" });
  }

  return new Response("Invalid action", { status: 400 });
}
