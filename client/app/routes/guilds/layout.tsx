import { Outlet } from "react-router";
import { css } from "styled-system/css";

export default function GuildListLayout() {
	return (
		<div
			className={css({
				display: "flex",
				minHeight: "100vh",
				paddingY: "6",
			})}
		>
			<div
				className={css({
					width: "900",
					margin: "0 auto",
				})}
			>
				<Outlet />
			</div>
		</div>
	);
}
