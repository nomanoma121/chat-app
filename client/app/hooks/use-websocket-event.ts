import { useEffect } from "react";
import { useWebSocket } from "~/contexts/websocket";
import type { WebSocketEventType } from "~/types/ws-event";

export const useWebSocketEvent = <T>(
	type: WebSocketEventType,
	callback: (data: T) => void,
) => {
	const wsClient = useWebSocket();
	useEffect(() => {
		wsClient.SetListener(type, callback);
		return () => {
			wsClient.RemoveListener(type);
		};
	}, [wsClient, type, callback]);
};
