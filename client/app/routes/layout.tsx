import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { css } from "styled-system/css";
import { useAuthMe } from "~/api/gen/auth/auth";
import { UserPanel } from "~/components/features/user-panel";
import { AUTH_TOKEN, INVALID_TOKEN_MESSAGE, WebSocketEvent } from "~/constants";
import { useWebSocketEvent } from "~/hooks/use-websocket-event";
import type { AuthErrorMessage } from "~/types/ws-event";

export default function ChannelLayout() {
	const { error } = useAuthMe();
	const navigate = useNavigate();
	const location = useLocation();
	const isAuthRoute =
		location.pathname.startsWith("/login") ||
		location.pathname.startsWith("/register");

	useWebSocketEvent<AuthErrorMessage>(WebSocketEvent.AuthError, (data) => {
		if (data.message === INVALID_TOKEN_MESSAGE) {
			localStorage.removeItem(AUTH_TOKEN);
			navigate("/login", { replace: true });
		}
	});

	useEffect(() => {
		if (!isAuthRoute && error?.code === 401) {
			localStorage.removeItem(AUTH_TOKEN);
			navigate("/login", { replace: true });
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
