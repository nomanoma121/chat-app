import type { WebSocketEvent } from "~/constants";

export type WebSocketEventType =
	(typeof WebSocketEvent)[keyof typeof WebSocketEvent];

export type AuthErrorMessage = { message: string };
