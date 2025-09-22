import { MoveLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { css } from "styled-system/css";
import { GuildIcon } from "~/components/ui/guild-icon";
import { IconButton } from "~/components/ui/icon-button";
import { useListMyGuilds } from "~/api/gen/guild/guild";

export const GuildList = () => {
	const { data, isPending, error } = useListMyGuilds();
	const navigate = useNavigate();
	return (
		<div
			className={css({
				width: "70px",
				height: "100vh",
				bg: "bg.secondary",
				borderColor: "border.soft",
				borderRightWidth: "1px",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
			})}
		>
			<div
				className={css({
					borderBottomWidth: "1px",
					borderColor: "border.soft",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					padding: "2",
				})}
			>
				<IconButton
					variant="ghost"
					color="text.bright"
					width="12"
					height="12"
					className={css({
						_hover: {
							bg: "accent.default",
							color: "text.bright",
						},
					})}
					onClick={() => navigate("/servers")}
				>
					<MoveLeft size={20} />
				</IconButton>
			</div>
			{data?.guilds.map((guild, index) => (
				<div
					key={index}
					className={css({
						marginTop: index === 0 ? "16px" : "8px",
						marginBottom: index === data.guilds.length - 1 ? "16px" : "0",
						position: "relative",
					})}
					onClick={() => navigate(`/servers/${guild.id}/channels/${guild.defaultChannelId}`)}
				>
					<GuildIcon
						src={guild.iconUrl}
						name={guild.name}
						alt={guild.name}
						size={48}
					/>
				</div>
			))}
		</div>
	);
};
