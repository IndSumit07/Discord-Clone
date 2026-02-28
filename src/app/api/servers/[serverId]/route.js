import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function PATCH(req, { params }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { serverId } = await params;
  const { name, icon_url } = await req.json();

  if (!name?.trim()) return new Response("Name Required", { status: 400 });

  const supabase = getSupabaseAdmin();

  // Verify ownership
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_id", userId)
    .single();
  const { data: server } = await supabase
    .from("servers")
    .select("*")
    .eq("id", serverId)
    .single();

  if (server?.owner_id !== profile?.id)
    return new Response("Forbidden", { status: 403 });

  const { data, error } = await supabase
    .from("servers")
    .update({ name, icon_url })
    .eq("id", serverId)
    .select()
    .single();

  if (error) return new Response(error.message, { status: 500 });

  return Response.json(data);
}

export async function DELETE(req, { params }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { serverId } = await params;
  const supabase = getSupabaseAdmin();

  // Verify ownership
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_id", userId)
    .single();
  const { data: server } = await supabase
    .from("servers")
    .select("*")
    .eq("id", serverId)
    .single();

  if (server?.owner_id !== profile?.id)
    return new Response("Forbidden", { status: 403 });

  const { error } = await supabase.from("servers").delete().eq("id", serverId);

  if (error) return new Response(error.message, { status: 500 });
  return Response.json({ success: true });
}
