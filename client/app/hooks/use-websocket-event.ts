import { useEffect } from "react";
import { useWebSocket } from "~/contexts/websocket";

export const useWebSocketEvent = <T = any>(
	type: string,
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
