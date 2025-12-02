import ws from "k6/ws";

export const WebSocketEvent = {
	SubscribeChannels: "SUBSCRIBE_CHANNELS",
	MessageCreate: "MESSAGE_CREATE",
	AuthRequest: "AUTH_REQUEST",
	AuthSuccess: "AUTH_SUCCESS",
	AuthError: "AUTH_ERROR",
} as const;

interface K6Socket {
	on(event: "open", handler: () => void): void;
	on(event: "message", handler: (data: string) => void): void;
	on(event: "close", handler: (code?: number, reason?: string) => void): void;
	on(event: "error", handler: (error: any) => void): void;
	on(event: "ping" | "pong", handler: () => void): void;
	send(data: string): void;
	close(code?: number): void;
	setTimeout(callback: () => void, delay: number): void;
	setInterval(callback: () => void, interval: number): void;
	ping(): void;
	pong(): void;
}

export type WebSocketMessage = {
	type: (typeof WebSocketEvent)[keyof typeof WebSocketEvent];
	data: any;
};

export interface SocketWrapper {
	send(data: WebSocketMessage): void;
	close(): void;
	setTimeout(callback: () => void, delay: number): void;
	setInterval(callback: () => void, interval: number): void;
}

type OnAuthCallback = (socket: SocketWrapper, userId: string) => void;
type OnMessageCallback = (socket: SocketWrapper, data: any) => void;

interface ConnectOptions {
	onAuth?: OnAuthCallback;
	onMessage?: OnMessageCallback;
	timeout?: number;
}

export function connect(
	baseUrl: string,
	token: string,
	options: ConnectOptions,
) {
	const { onAuth, onMessage, timeout = 120000 } = options;

	ws.connect(baseUrl, {}, (socket: K6Socket) => {
		const wrapper: SocketWrapper = {
			send(data: WebSocketMessage) {
				socket.send(JSON.stringify(data));
			},
			close() {
				socket.close();
			},
			setTimeout(callback: () => void, delay: number) {
				socket.setTimeout(callback, delay);
			},
			setInterval(callback: () => void, interval: number) {
				socket.setInterval(callback, interval);
			},
		};

		socket.on("open", () => {
			socket.send(
				JSON.stringify({
					type: WebSocketEvent.AuthRequest,
					data: { token },
				}),
			);
		});

		socket.on("message", (raw) => {
			const messages = raw.split("\n").filter((m: string) => m.trim());
			for (const msg of messages) {
				try {
					const data = JSON.parse(msg);
					if (data.type === WebSocketEvent.AuthSuccess && onAuth) {
						const userId = data.data?.user_id || data.data?.userId || "";
						onAuth(wrapper, userId);
					}
					if (onMessage) {
						onMessage(wrapper, data);
					}
				} catch (e) {
					console.error(`Failed to parse WebSocket message: ${msg}`);
				}
			}
		});

		socket.on("error", (error) => {
			console.error("WebSocket error:", error);
		});

		socket.setTimeout(() => {
			socket.close();
		}, timeout);
	});
}
