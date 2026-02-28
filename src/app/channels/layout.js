import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { syncUser } from "@/actions/syncUser";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import ServerSidebar from "@/components/layout/server-sidebar";
import DMSidebar from "@/components/layout/dm-sidebar";
import ModalProvider from "@/components/modals/modal-provider";
import SidebarWrapper from "@/components/layout/sidebar-wrapper";

export default async function ChannelsLayout({ children }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Sync user to supabase on every load (cached via upsert)
  const profile = await syncUser();

  // Fetch user's servers
  const supabase = getSupabaseAdmin();
  let servers = [];
  let conversations = [];

  if (profile) {
    const { data: memberData } = await supabase
      .from("server_members")
      .select("server:servers(*)")
      .eq("profile_id", profile.id);

    servers = memberData?.map((m) => m.server).filter(Boolean) ?? [];

    const { data: convData } = await supabase
      .from("conversations")
      .select(
        `
        id,
        member_one_id,
        member_two_id,
        member_one:profiles!conversations_member_one_id_fkey(*),
        member_two:profiles!conversations_member_two_id_fkey(*)
      `,
      )
      .or(`member_one_id.eq.${profile.id},member_two_id.eq.${profile.id}`)
      .order("created_at", { ascending: false });

    conversations =
      convData?.map((c) => ({
        ...c,
        profile: c.member_one_id === profile.id ? c.member_two : c.member_one,
      })) ?? [];
  }

  return (
    <div
      className="flex h-full w-full overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      <SidebarWrapper>
        <ServerSidebar servers={servers} />
        <DMSidebar conversations={conversations} />
      </SidebarWrapper>
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
      <ModalProvider />
    </div>
  );
}
