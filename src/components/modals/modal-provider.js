"use client";

import CreateServerModal from "./create-server-modal";
import MessageFileModal from "./message-file-modal";
import ServerSettingsModal from "./server-settings-modal";
import CreateChannelModal from "./create-channel-modal";
import EditChannelModal from "./edit-channel-modal";
import InviteModal from "./invite-modal";

export default function ModalProvider() {
  return (
    <>
      <CreateServerModal />
      <MessageFileModal />
      <ServerSettingsModal />
      <CreateChannelModal />
      <EditChannelModal />
      <InviteModal />
    </>
  );
}
