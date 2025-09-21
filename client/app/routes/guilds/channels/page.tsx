import { css } from "styled-system/css";
import { ChatArea } from "./internal/components/chat-area";
import { Sidebar } from "./internal/components/sidebar";
import { useOutletContext } from "react-router";

export default function Channels() {
	return (
		<div className={css({ display: "flex" })}>
			<Sidebar />
			<ChatArea />
		</div>
	);
}
