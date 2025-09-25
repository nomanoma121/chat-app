import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { css } from "styled-system/css";
import { useGetGuildByID, useUpdateGuild } from "~/api/gen/guild/guild";
import { Tabs } from "~/components/features/tabs";
import { Button } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";
import { GeneralTab } from "./internal/components/general-tab";
import { MembersTab } from "./internal/components/members-tab";
import { Spinner } from "~/components/ui/spinner";

export default function ServerSetting() {
	const { serverId: guildId } = useParams<{ serverId: string }>();
	if (!guildId) throw new Error("guildId is required");
	const navigate = useNavigate();
	const { data, isLoading } = useGetGuildByID(guildId);

	if (isLoading) {
		return (
			<div
				className={css({
					height: "100vh",
					width: "800",
					margin: "0 auto",
					background: "bg.primary",
					paddingY: "10",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
				})}
			>
				<Spinner size="lg" />
				<Text className={css({ mt: "4", color: "text.medium" })}>
					サーバー設定を読み込み中...
				</Text>
			</div>
		);
	}

	if (!data?.guild) {
		return (
			<div
				className={css({
					height: "100vh",
					width: "800",
					margin: "0 auto",
					background: "bg.primary",
					paddingY: "10",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
				})}
			>
				<Text className={css({ color: "text.bright", fontSize: "lg" })}>
					サーバーが見つかりません
				</Text>
				<Button
					variant="ghost"
					size="sm"
					onClick={() => navigate(-1)}
					className={css({
						mt: "4",
						color: "text.medium",
						_hover: {
							color: "text.bright",
							background: "accent.default",
						},
					})}
				>
					<ArrowLeft size={18} />
					<Text className={css({ ml: "2" })}>戻る</Text>
				</Button>
			</div>
		);
	}

	return (
		<div
			className={css({
				height: "100vh",
				width: "800",
				margin: "0 auto",
				background: "bg.primary",
				paddingY: "10",
			})}
		>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => navigate(-1)}
				className={css({
					color: "text.medium",
					_hover: {
						color: "text.bright",
						background: "accent.default",
					},
				})}
			>
				<ArrowLeft size={18} />
				<Text className={css({ ml: "8px" })}>サーバーに戻る</Text>
			</Button>
			<Heading
				className={css({ color: "text.bright", mt: "12px", mb: "20px" })}
				size="xl"
			>
				サーバー設定
			</Heading>
			<Tabs.Root defaultValue="general" variant="enclosed">
				<Tabs.List
					className={css({
						bgColor: "bg.tertiary",
						border: "none",
					})}
				>
					<Tabs.Trigger value="general">一般</Tabs.Trigger>
					<Tabs.Trigger value="members">メンバー</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="general">
					<GeneralTab guild={data.guild} />
				</Tabs.Content>
				<Tabs.Content value="members">
					<MembersTab guild={data.guild} />
				</Tabs.Content>
			</Tabs.Root>
		</div>
	);
}
