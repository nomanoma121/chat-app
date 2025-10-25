import { WebSocketEvent } from "~/constants";

export type WebSocketEventType = typeof WebSocketEvent[keyof typeof WebSocketEvent];
