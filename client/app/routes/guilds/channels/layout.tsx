import { Outlet, useParams } from "react-router";
import { css } from "styled-system/css";
import { useGetGuildOverview } from "~/api/gen/guild/guild";
import type { GuildDetail } from "~/api/gen/guildTypeProto.schemas";
import { NotFoundPage } from "~/components/features/not-found-page";
import { Spinner } from "~/components/ui/spinner";
import { Text } from "~/components/ui/text";

export type GuildsContext = {
	guild: GuildDetail;
	refetch: () => void;
	isPending: boolean;
	error: unknown;
};

export default function GuildListLayout() {
	const params = useParams();
	const guildId = params.serverId;
	if (!guildId) {
		return <NotFoundPage />;
	}

	const { data, isPending, error, refetch } = useGetGuildOverview(guildId);

	if (isPending) {
		return (
			<div
				className={css({
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					minHeight: "100vh",
					backgroundColor: "bg.primary",
				})}
			>
				<Spinner size="lg" />
				<Text className={css({ mt: "4", color: "text.medium" })}>
					サーバー情報を読み込み中...
				</Text>
			</div>
		);
	}

	if (error) {
		return <NotFoundPage />;
	}

	return <Outlet context={{ guild: data?.guild, refetch, isPending, error }} />;
}
