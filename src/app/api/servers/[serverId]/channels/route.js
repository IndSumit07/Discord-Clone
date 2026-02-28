import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(req, { params }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const paramsData = await params;
  const serverId = paramsData.serverId;
  const { name, type, category_id } = await req.json();

  if (!name || !type) return new Response("Missing fields", { status: 400 });

  const supabase = getSupabaseAdmin();

  // Verify membership and permissions
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_id", userId)
    .single();

  const { data: server } = await supabase
    .from("servers")
    .select("owner_id")
    .eq("id", serverId)
    .single();

  if (!server || server.owner_id !== profile?.id) {
    return new Response("Forbidden", { status: 403 });
  }

  const { data, error } = await supabase
    .from("channels")
    .insert({
      server_id: serverId,
      name,
      type,
      category_id: category_id || null,
    })
    .select()
    .single();

  if (error) return new Response(error.message, { status: 500 });

  return Response.json(data);
}
