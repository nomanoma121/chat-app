import { useListMyGuilds } from "~/api/gen/guild/guild";
import { Button } from "~/components/ui/button";

export default function Guild() {
	const { data, isPending, error } = useListMyGuilds();

	return (
		<div>
			<h1>Server List</h1>
			{isPending && <p>Loading...</p>}
			{error && <p>Error: {error.message}</p>}
			<p>
				This is the server list page. You belong to{" "}
				<strong>{data?.guilds?.[0]?.name}</strong>.
			</p>
			<Button>Default Button</Button>
		</div>
	);
}
