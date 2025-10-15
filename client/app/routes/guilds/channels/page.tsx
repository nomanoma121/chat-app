import { css } from "styled-system/css";
import { ChatArea } from "./internal/components/chat-area";
import { Sidebar } from "./internal/components/sidebar";

export default function Channels() {
	console.log("Rendering Channels component");
	const token = localStorage.getItem("authToken");
	if (!token) {
		console.log("No token found, redirecting to login...");
	}

	const ws = new WebSocket("ws://localhost:50054/ws");

	ws.onopen = () => {
		console.log("WebSocket connection established");
		ws.send(JSON.stringify({ 
			type: "auth",
			token
		}));
	};

	ws.onmessage = (event) => {
		const message = JSON.parse(event.data);
		console.log("Received message:", message);
	};

	ws.onclose = () => {
		console.log("WebSocket connection closed");
	};

	ws.onerror = (error) => {
		console.error("WebSocket error:", error);
	};

	return (
		<div className={css({ display: "flex" })}>
			<Sidebar />
			<ChatArea />
		</div>
	);
}
