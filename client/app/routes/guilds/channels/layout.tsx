import { Outlet, useParams } from "react-router";
import { useGetGuildOverview } from "~/api/gen/guild/guild";

export default function GuildListLayout() {
  const params = useParams();
  const guildId = params.serverId;
  if (!guildId) {
    return <div>Server ID is missing</div>;
  }

  const { data, isPending, error } = useGetGuildOverview(guildId);
  return <Outlet context={{ guild: data?.guild, isPending, error }} />;
}
