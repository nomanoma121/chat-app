export const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
export const CLIENT_BASE_URL =
	import.meta.env.VITE_CLIENT_BASE_URL || "http://localhost:5173";
export const WS_BASE_URL =
	import.meta.env.VITE_WS_BASE_URL || "ws://localhost:50054/ws";

export const AUTH_TOKEN = "authToken";
export const INVALID_TOKEN_MESSAGE = "Invalid token";

export const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return date.toLocaleDateString("ja-JP", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
};

export const WebSocketEvent = {
	SubscribeChannels: "SUBSCRIBE_CHANNELS",
	MessageCreate: "MESSAGE_CREATE",
	AuthRequest: "AUTH_REQUEST",
	AuthSuccess: "AUTH_SUCCESS",
	AuthError: "AUTH_ERROR",
} as const;
