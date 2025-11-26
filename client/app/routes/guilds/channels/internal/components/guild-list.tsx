import { MoveLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { css } from "styled-system/css";
import { useListMyGuilds } from "~/api/gen/guild/guild";
import { GuildIcon } from "~/components/ui/guild-icon";
import { IconButton } from "~/components/ui/icon-button";
import { Spinner } from "~/components/ui/spinner";
import { addCacheBust } from "~/utils";

export const GuildList = () => {
	const { data, isPending, error } = useListMyGuilds();
	const navigate = useNavigate();

	if (error) {
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
					justifyContent: "center",
				})}
			>
				<div
					className={css({
						transform: "rotate(-90deg)",
						fontSize: "xs",
						color: "text.muted",
					})}
				>
					エラー
				</div>
			</div>
		);
	}

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
			{isPending ? (
				<div
					className={css({
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						flex: 1,
					})}
				>
					<Spinner size="sm" />
				</div>
			) : (
				data?.guilds.map((guild) => (
					<div
						key={guild.id}
						className={css({
							marginTop: "8px",
							marginBottom: "0",
							position: "relative",
							"&:first-of-type": {
								marginTop: "16px",
							},
							"&:last-of-type": {
								marginBottom: "16px",
							},
						})}
						onClick={() =>
							navigate(
								`/servers/${guild.id}/channels/${guild.defaultChannelId}`,
							)
						}
					>
						<GuildIcon
							src={addCacheBust(guild.iconUrl)}
							name={guild.name}
							alt={guild.name}
							size={48}
						/>
					</div>
				))
			)}
		</div>
	);
};
