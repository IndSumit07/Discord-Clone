import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function PATCH(req, { params }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { messageId } = await params;
  const { content } = await req.json();

  if (!content?.trim())
    return new Response("Content Required", { status: 400 });

  const supabase = getSupabaseAdmin();

  // Verify ownership
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_id", userId)
    .single();
  const { data: message } = await supabase
    .from("messages")
    .select("*")
    .eq("id", messageId)
    .single();

  if (!message) {
    // Check if direct message
    const { data: dm } = await supabase
      .from("direct_messages")
      .select("*")
      .eq("id", messageId)
      .single();
    if (!dm) return new Response("Message not found", { status: 404 });

    if (dm.profile_id !== profile.id)
      return new Response("Forbidden", { status: 403 });

    const { data, error } = await supabase
      .from("direct_messages")
      .update({ content, is_edited: true })
      .eq("id", messageId)
      .select()
      .single();

    if (error) return new Response(error.message, { status: 500 });
    return Response.json(data);
  } else {
    if (message.profile_id !== profile.id)
      return new Response("Forbidden", { status: 403 });

    const { data, error } = await supabase
      .from("messages")
      .update({ content, is_edited: true })
      .eq("id", messageId)
      .select()
      .single();

    if (error) return new Response(error.message, { status: 500 });
    return Response.json(data);
  }
}

export async function DELETE(req, { params }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { messageId } = await params;
  const supabase = getSupabaseAdmin();

  // Verify ownership
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_id", userId)
    .single();
  const { data: message } = await supabase
    .from("messages")
    .select("*")
    .eq("id", messageId)
    .single();

  if (!message) {
    // Check if direct message
    const { data: dm } = await supabase
      .from("direct_messages")
      .select("*")
      .eq("id", messageId)
      .single();
    if (!dm) return new Response("Message not found", { status: 404 });

    if (dm.profile_id !== profile.id)
      return new Response("Forbidden", { status: 403 });

    const { error } = await supabase
      .from("direct_messages")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", messageId);

    if (error) return new Response(error.message, { status: 500 });
    return Response.json({ success: true });
  } else {
    if (message.profile_id !== profile.id)
      return new Response("Forbidden", { status: 403 });

    const { error } = await supabase
      .from("messages")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", messageId);

    if (error) return new Response(error.message, { status: 500 });
    return Response.json({ success: true });
  }
}
