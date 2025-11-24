export const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
export const CLIENT_BASE_URL =
	import.meta.env.VITE_CLIENT_BASE_URL || "http://localhost:5173";
export const WS_BASE_URL =
	import.meta.env.VITE_WS_BASE_URL || "ws://localhost:50054/ws";
export const MEDIA_BASE_URL = 
	import.meta.env.VITE_MEDIA_BASE_URL || "http://localhost:9001"

export const AUTH_TOKEN = "authToken";
export const INVALID_TOKEN_MESSAGE = "Invalid token";

export const WebSocketEvent = {
	SubscribeChannels: "SUBSCRIBE_CHANNELS",
	MessageCreate: "MESSAGE_CREATE",
	AuthRequest: "AUTH_REQUEST",
	AuthSuccess: "AUTH_SUCCESS",
	AuthError: "AUTH_ERROR",
} as const;

export const DEFAULT_ICON_URL = `${MEDIA_BASE_URL}/user_icons/default.png`

export const DEFAULT_USER_ICONS = {
	BLUE: `${MEDIA_BASE_URL}/icons/users/user-blue.png`,
	GREEN: `${MEDIA_BASE_URL}/icons/users/user-green.png`,
	GRAY: `${MEDIA_BASE_URL}/icons/users/user-gray.png`,
	YELLOW: `${MEDIA_BASE_URL}/icons/users/user-yellow.png`,
	RED: `${MEDIA_BASE_URL}/icons/users/user-red.png`,
}
