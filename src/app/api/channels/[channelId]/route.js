import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function PATCH(req, { params }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const paramsData = await params;
  const channelId = paramsData.channelId;
  const { name, type } = await req.json();

  if (!name.trim()) return new Response("Name required", { status: 400 });

  const supabase = getSupabaseAdmin();

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!profile) return new Response("Profile not found", { status: 404 });

  // Get channel and server info to check permissions
  const { data: channel } = await supabase
    .from("channels")
    .select("server_id")
    .eq("id", channelId)
    .single();

  if (!channel) return new Response("Channel not found", { status: 404 });

  // Check if user is the server owner
  const { data: server } = await supabase
    .from("servers")
    .select("owner_id")
    .eq("id", channel.server_id)
    .single();

  if (!server || server.owner_id !== profile.id) {
    return new Response("Forbidden: Only owners can edit channels", {
      status: 403,
    });
  }

  const { data, error } = await supabase
    .from("channels")
    .update({ name, type })
    .eq("id", channelId)
    .select()
    .single();

  if (error) return new Response(error.message, { status: 500 });

  return Response.json(data);
}

export async function DELETE(req, { params }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const paramsData = await params;
  const channelId = paramsData.channelId;
  const supabase = getSupabaseAdmin();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  if (!profile) return new Response("Profile not found", { status: 404 });

  const { data: channel } = await supabase
    .from("channels")
    .select("server_id, name")
    .eq("id", channelId)
    .single();

  if (!channel) return new Response("Channel not found", { status: 404 });

  // Prevent deleting general
  if (channel.name === "general") {
    return new Response("Cannot delete general channel", { status: 400 });
  }

  const { data: server } = await supabase
    .from("servers")
    .select("owner_id")
    .eq("id", channel.server_id)
    .single();

  if (!server || server.owner_id !== profile.id) {
    return new Response("Forbidden", { status: 403 });
  }

  const { error } = await supabase
    .from("channels")
    .delete()
    .eq("id", channelId);

  if (error) return new Response(error.message, { status: 500 });

  return new Response("Deleted", { status: 200 });
}
