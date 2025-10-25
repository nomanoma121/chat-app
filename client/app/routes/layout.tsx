import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { css } from "styled-system/css";
import { useAuthMe } from "~/api/gen/auth/auth";
import { UserPanel } from "~/components/features/user-panel";
import { WebSocketEvent } from "~/constants";
import { useWebSocket } from "~/contexts/websocket";
import { useWebSocketEvent } from "~/hooks/use-websocket-event";

export default function ChannelLayout() {
	const token = localStorage.getItem("authToken");
	const { error } = useAuthMe();
	const navigate = useNavigate();
	const location = useLocation();
	const isAuthRoute =
		location.pathname.startsWith("/login") ||
		location.pathname.startsWith("/register");
	const wsClient = useWebSocket();

	useWebSocketEvent(WebSocketEvent.AuthSuccess, (data) => {
		console.log("AuthSuccess:", data);
	});

	useEffect(() => {
		if (token) {
			wsClient.Authenticate(token);
		}
	}, [token, wsClient]);

	useEffect(() => {
		if (!isAuthRoute && error?.code === 401) {
			navigate("/login");
		}
	}, [navigate, isAuthRoute, error?.code]);

	return (
		<div>
			<Outlet />
			<div
				className={css({
					position: "fixed",
					bottom: "0",
					left: "0",
					width: "320px",
					borderColor: "border.soft",
					padding: "8px",
					zIndex: 1000,
				})}
			>
				<UserPanel />
			</div>
		</div>
	);
}
