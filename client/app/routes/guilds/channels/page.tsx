import { Sidebar } from "./internal/components/sidebar";
import { ChatArea } from "./internal/components/chat-area";
import { css } from "styled-system/css";

export default function Channels() {
  return (
    <div className={css({ display: "flex" })}>
      <Sidebar />
      <ChatArea />
    </div>
  );
}
