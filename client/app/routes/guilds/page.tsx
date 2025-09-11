import { useListMyGuilds } from "~/api/gen/guild/guild";

export default function Guild() {
	const { data, isPending, error } = useListMyGuilds();

	return (
		<div>
			<div>
				<h1>サーバー一覧</h1>
				<p>参加しているサーバーを選択してください</p>
			</div>
				
		</div>
	);
}
