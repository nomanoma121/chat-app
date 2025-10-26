import { useEffect, useRef } from "react";
import { useWebSocket } from "~/contexts/websocket";
import type { WebSocketEventType } from "~/types/ws-event";

export const useWebSocketEvent = <T>(
	type: WebSocketEventType,
	callback: (data: T) => void,
) => {
	const wsClient = useWebSocket();
	const callbackRef = useRef(callback);

	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => {
		const handler = (data: T) => {
			callbackRef.current(data);
		};

		wsClient.SetListener(type, handler);
		return () => {
			wsClient.RemoveListener(type);
		};
	}, [wsClient, type]);
};
