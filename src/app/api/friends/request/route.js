import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { targetEmail } = await req.json();
  if (!targetEmail) return new Response("Email required", { status: 400 });

  const supabase = getSupabaseAdmin();

  // Get sender profile
  const { data: sender } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("clerk_id", userId)
    .single();

  if (!sender) return new Response("Profile not found", { status: 404 });

  // Get recipient profile
  const { data: recipient } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", targetEmail.trim())
    .single();

  if (!recipient) return new Response("User not found", { status: 404 });
  if (sender.id === recipient.id)
    return new Response("Cannot add yourself", { status: 400 });

  // Check if already friends or requested
  const { data: existingRequest } = await supabase
    .from("friend_requests")
    .select("id")
    .or(
      `and(sender_id.eq.${sender.id},receiver_id.eq.${recipient.id}),and(sender_id.eq.${recipient.id},receiver_id.eq.${sender.id})`,
    )
    .single();

  if (existingRequest)
    return new Response("Request already exists", { status: 400 });

  const { data: existingFriend } = await supabase
    .from("friends")
    .select("id")
    .or(
      `and(profile_one_id.eq.${sender.id},profile_two_id.eq.${recipient.id}),and(profile_one_id.eq.${recipient.id},profile_two_id.eq.${sender.id})`,
    )
    .single();

  if (existingFriend) return new Response("Already friends", { status: 400 });

  // Create request
  const { data, error } = await supabase
    .from("friend_requests")
    .insert({
      sender_id: sender.id,
      receiver_id: recipient.id,
      status: "pending",
    })
    .select()
    .single();

  if (error) return new Response(error.message, { status: 500 });

  return Response.json(data);
}
