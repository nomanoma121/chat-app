import { Outlet, useParams } from "react-router";
import { useGetGuildOverview } from "~/api/gen/guild/guild";
import type { GuildDetail } from "~/api/gen/guildTypeProto.schemas";

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
		return <div>Server ID is missing</div>;
	}

	const { data, isPending, error, refetch } = useGetGuildOverview(guildId);
	return <Outlet context={{ guild: data?.guild, refetch, isPending, error }} />;
}
