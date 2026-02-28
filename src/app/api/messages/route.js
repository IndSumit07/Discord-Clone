import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { channelId, conversationId, content, file_url, file_type } =
    await req.json();
  if (!content?.trim() && !file_url)
    return new Response("Content or file required", { status: 400 });

  const supabase = getSupabaseAdmin();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!profile) return new Response("Profile not found", { status: 404 });

  const isDM = !!conversationId;
  const table = isDM ? "direct_messages" : "messages";

  const payload = {
    profile_id: profile.id,
    content: content?.trim() || null,
    file_url: file_url || null,
    file_type: file_type || null,
  };

  if (isDM) {
    payload.conversation_id = conversationId;
  } else {
    payload.channel_id = channelId;
  }

  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select("*, profile:profiles(*)")
    .single();

  if (error) return new Response(error.message, { status: 500 });

  return Response.json(data);
}
