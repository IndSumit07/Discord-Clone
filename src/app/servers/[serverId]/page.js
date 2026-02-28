import { getSupabaseAdmin } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ServerPage({ params }) {
  const { serverId } = await params;
  const supabase = getSupabaseAdmin();

  // Redirect to first text channel
  const { data: firstChannel } = await supabase
    .from("channels")
    .select("id")
    .eq("server_id", serverId)
    .eq("type", "text")
    .order("position")
    .limit(1)
    .single();

  if (firstChannel) {
    redirect(`/servers/${serverId}/channels/${firstChannel.id}`);
  }

  return (
    <div
      className="flex flex-1 items-center justify-center flex-col gap-4"
      style={{ background: "var(--background)" }}
    >
      <div className="text-5xl">👋</div>
      <h2
        className="text-2xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        Welcome to this server!
      </h2>
      <p style={{ color: "var(--text-muted)" }}>
        Create your first channel to get started.
      </p>
    </div>
  );
}
