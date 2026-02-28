import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ServerSidebar from "@/components/layout/server-sidebar";
import ChannelSidebar from "@/components/layout/channel-sidebar";
import ModalProvider from "@/components/modals/modal-provider";
import { syncUser } from "@/actions/syncUser";
import SidebarWrapper from "@/components/layout/sidebar-wrapper";

export default async function ServerLayout({ children, params }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await syncUser();
  const supabase = getSupabaseAdmin();

  // Check if user is a member of this server
  const { data: memberData } = await supabase
    .from("server_members")
    .select("server:servers(*)")
    .eq("profile_id", profile?.id)
    .limit(100);

  const servers = memberData?.map((m) => m.server).filter(Boolean) ?? [];
  const { serverId } = await params;
  const currentServer = servers.find((s) => s.id === serverId);

  if (!currentServer) redirect("/channels/@me");

  // Fetch categories and channels
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("server_id", serverId)
    .order("position");

  const { data: channels } = await supabase
    .from("channels")
    .select("*")
    .eq("server_id", serverId)
    .order("position");

  return (
    <div
      className="flex h-full w-full overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      <SidebarWrapper>
        <ServerSidebar servers={servers} />
        <ChannelSidebar
          server={currentServer}
          categories={categories ?? []}
          channels={channels ?? []}
          profile={profile}
        />
      </SidebarWrapper>
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {children}
      </main>
      <ModalProvider />
    </div>
  );
}
