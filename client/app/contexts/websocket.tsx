import { createContext, useContext } from "react";
import type { WebSocketClient } from "~/api/websocket";

export const WebSocketContext = createContext<WebSocketClient | null>(null);

export const WebSocketProvider = ({
	children,
	wsClient,
}: {
	children: React.ReactNode;
	wsClient: WebSocketClient;
}) => {
	return (
		<WebSocketContext.Provider value={wsClient}>
			{children}
		</WebSocketContext.Provider>
	);
};

export const useWebSocket = () => {
	const context = useContext(WebSocketContext);
	if (!context) {
		throw new Error("useWebSocket must be used within a WebSocketProvider");
	}
	return context;
};
