import { Users } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { css } from "styled-system/css";
import { useGetGuildByInviteCode, useJoinGuild } from "~/api/gen/invite/invite";
import { Avatar } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Spinner } from "~/components/ui/spinner";
import { Text } from "~/components/ui/text";
import { useToast } from "~/hooks/use-toast";

export default function InvitePage() {
	const navigate = useNavigate();
	const toast = useToast();
	const { inviteCode } = useParams();

	if (!inviteCode) {
		return null;
	}

	const { data, isLoading, isError } = useGetGuildByInviteCode(inviteCode);
	const { mutateAsync: joinGuild, isPending: isJoining } = useJoinGuild();

	const handleJoinGuild = async () => {
		try {
			await joinGuild({ inviteCode, data: {} });
			toast.success("サーバーに参加しました");
			navigate(`/servers/${data?.invite?.guild?.id}/channels/${data?.invite?.guild?.defaultChannelId}`);
		} catch (err) {
			toast.error("サーバーへの参加に失敗しました");
		}
	};

	if (isLoading) {
		return (
			<div
				className={css({
					minHeight: "100vh",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					background: "bg.primary",
				})}
			>
				<Spinner size="lg" />
				<Text className={css({ mt: "4", color: "text.medium" })}>
					招待情報を読み込み中...
				</Text>
			</div>
		);
	}

	if (isError || !data?.invite) {
		return (
			<div
				className={css({
					minHeight: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: "bg.primary",
				})}
			>
				<Card.Root
					className={css({
						width: "400px",
						padding: "30px",
						background: "bg.secondary",
						textAlign: "center",
					})}
				>
					<Card.Body>
						<div
							className={css({
								fontSize: "4xl",
								marginBottom: "16px",
							})}
						>
							😞
						</div>
						<Text
							className={css({
								fontSize: "xl",
								fontWeight: "bold",
								color: "text.bright",
								marginBottom: "8px",
							})}
						>
							招待が無効です
						</Text>
						<Text
							className={css({
								color: "text.medium",
								marginBottom: "24px",
							})}
						>
							この招待リンクは期限切れか、無効になっています
						</Text>
						<Button
							onClick={() => navigate("/guilds")}
							className={css({ width: "100%" })}
						>
							サーバー一覧に戻る
						</Button>
					</Card.Body>
				</Card.Root>
			</div>
		);
	}

	const invite = data.invite;
	const guild = invite.guild;

	return (
		<div
			className={css({
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "bg.primary",
				padding: "20px",
			})}
		>
			<Card.Root
				className={css({
					width: "420px",
					background: "bg.secondary",
					boxShadow: "lg",
				})}
			>
				<Card.Header
					className={css({
						textAlign: "center",
						padding: "30px 30px 20px 30px",
					})}
				>
					<Text
						className={css({
							fontSize: "xl",
							fontWeight: "bold",
							color: "text.bright",
							marginBottom: "12px",
						})}
					>
						サーバーへの招待
					</Text>
					<div
						className={css({
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "8px",
							marginBottom: "4px",
						})}
					>
						<Avatar
							name={invite.creator?.name || "Unknown"}
							src={invite.creator?.iconUrl}
							size="sm"
							className={css({
								width: "24px",
								height: "24px",
							})}
						/>
						<Text
							className={css({
								color: "text.medium",
								fontSize: "sm",
							})}
						>
							{invite.creator?.name || "誰か"}さんがあなたをサーバーに招待しました
						</Text>
					</div>
				</Card.Header>

				<Card.Body
					className={css({
						padding: "0 30px 30px 30px",
					})}
				>
					{/* サーバー情報 */}
					<div
						className={css({
							display: "flex",
							alignItems: "center",
							gap: "20px",
							padding: "24px",
							background: "bg.tertiary",
							borderRadius: "lg",
							marginBottom: "32px",
						})}
					>
						<Avatar
							name={guild?.name || ""}
							src={guild?.iconUrl}
							size="lg"
							className={css({
								width: "72px",
								height: "72px",
							})}
						/>
						<div className={css({ flex: 1 })}>
							<Text
								className={css({
									fontSize: "xl",
									fontWeight: "bold",
									color: "text.bright",
									marginBottom: "6px",
								})}
							>
								{guild?.name}
							</Text>
							{guild?.description && (
								<Text
									className={css({
										fontSize: "sm",
										color: "text.medium",
										marginBottom: "12px",
										lineHeight: "1.4",
									})}
								>
									{guild?.description}
								</Text>
							)}
							<div
								className={css({
									display: "flex",
									alignItems: "center",
									gap: "6px",
									fontSize: "sm",
									color: "text.medium",
								})}
							>
								<Users size={16} />
								<span>{guild?.memberCount || 0} メンバー</span>
							</div>
						</div>
					</div>

					{/* アクションボタン */}
					<div
						className={css({
							display: "flex",
							flexDirection: "column",
							gap: "12px",
						})}
					>
						<Button
							onClick={handleJoinGuild}
							disabled={isJoining}
							size="lg"
							className={css({
								width: "100%",
								fontSize: "md",
								fontWeight: "semibold",
								height: "48px",
							})}
						>
							{isJoining ? "参加中..." : `${guild?.name || "サーバー"}に参加`}
						</Button>
						<Button
							variant="outline"
							onClick={() => navigate("/servers")}
							size="lg"
							className={css({
								width: "100%",
								height: "48px",
								color: "text.medium",
								_hover: {
									color: "text.bright",
								},
							})}
						>
							キャンセル
						</Button>
					</div>
				</Card.Body>
			</Card.Root>
		</div>
	);
}
