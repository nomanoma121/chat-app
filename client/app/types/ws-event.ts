import { WebSocketEventType } from "~/constants";

export type WebSocketEventType = typeof WebSocketEventType[keyof typeof WebSocketEventType];
