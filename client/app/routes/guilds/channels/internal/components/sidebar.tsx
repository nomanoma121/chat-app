import { css } from "styled-system/css";
import { GuildList } from "./guild-list";
import { GuildPanel } from "./guild-panel";

export const Sidebar = () => {
	return (
		<div
			className={css({
				width: "320px",
				height: "100vh",
				bg: "bg.secondary",
				display: "flex",
				flexDirection: "row",
			})}
		>
			<GuildList />
			<GuildPanel />
		</div>
	);
};
