import { Outlet, useNavigate } from "react-router";
import { css } from "styled-system/css";
import { useAuthMe } from "~/api/gen/auth/auth";
import { UserPanel } from "~/components/features/user-panel";

export default function ChannelLayout() {
	const { data, error } = useAuthMe();
	const navigate = useNavigate();

	if (error?.code === 401) {
		navigate("/login");
		return;
	}

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
