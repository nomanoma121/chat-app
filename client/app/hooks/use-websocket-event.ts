import { useEffect } from "react";
import { useOutletContext } from "react-router";
import type { WebSocketClient } from "~/api/websocket";

export const useWebSocketEvent = <T = any>(
	wsClient: WebSocketClient,
	type: string,
	callback: (data: T) => void,
) => {
	useEffect(() => {
		wsClient.SetListener(type, callback);
		return () => {
			wsClient.RemoveListener(type);
		};
	}, [wsClient, type, callback]);
};
