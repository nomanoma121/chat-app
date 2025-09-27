import { Calendar, Hash, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { css } from "styled-system/css";
import { useCreateGuildInvite } from "~/api/gen/invite/invite";
import { Avatar } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

export default function InvitePage() {
	const navigate = useNavigate();
	const { inviteCode, guildId } = useParams();
	if (!inviteCode) {
		return null;
	}
	const { data: inviteData } = useGetGuildInvites(inviteCode);
	const [isJoining, setIsJoining] = useState(false);

	const handleJoinGuild = async () => {
		setIsJoining(true);
		try {
			// 実際のAPI呼び出し
			// await joinGuild({ inviteCode });

			// モックの成功処理
			setTimeout(() => {
				navigate(`/servers/${guildId}/channels/1`);
			}, 1000);
		} catch (error) {
			console.error("Failed to join guild:", error);
			setIsJoining(false);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("ja-JP", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getRemainingUses = () => {
		if (mockInviteData.maxUses === 0) return "無制限";
		return `${mockInviteData.maxUses - mockInviteData.currentUses}回`;
	};

	const isExpired = () => {
		return new Date(mockInviteData.expiresAt) < new Date();
	};

	if (!mockInviteData.isValid || isExpired()) {
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
						<h1
							className={css({
								fontSize: "xl",
								fontWeight: "bold",
								color: "text.bright",
								marginBottom: "8px",
							})}
						>
							招待が無効です
						</h1>
						<p
							className={css({
								color: "text.medium",
								marginBottom: "24px",
							})}
						>
							この招待リンクは期限切れか、無効になっています
						</p>
						<Button
							onClick={() => navigate("/servers")}
							className={css({ width: "100%" })}
						>
							サーバー一覧に戻る
						</Button>
					</Card.Body>
				</Card.Root>
			</div>
		);
	}

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
					width: "450px",
					background: "bg.secondary",
				})}
			>
				<Card.Header
					className={css({
						textAlign: "center",
						padding: "30px 30px 20px 30px",
					})}
				>
					<h1
						className={css({
							fontSize: "xl",
							fontWeight: "bold",
							color: "text.bright",
							marginBottom: "8px",
						})}
					>
						サーバーへの招待
					</h1>
					<p
						className={css({
							color: "text.medium",
							fontSize: "sm",
						})}
					>
						{mockInviteData.creator.name}さんがあなたをサーバーに招待しました
					</p>
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
							gap: "16px",
							padding: "20px",
							background: "bg.tertiary",
							borderRadius: "lg",
							marginBottom: "24px",
						})}
					>
						<Avatar
							name={mockInviteData.guild.name}
							src={mockInviteData.guild.icon}
							size="lg"
							className={css({
								width: "64px",
								height: "64px",
							})}
						/>
						<div className={css({ flex: 1 })}>
							<h2
								className={css({
									fontSize: "lg",
									fontWeight: "semibold",
									color: "text.bright",
									marginBottom: "4px",
								})}
							>
								{mockInviteData.guild.name}
							</h2>
							<p
								className={css({
									fontSize: "sm",
									color: "text.medium",
									marginBottom: "8px",
								})}
							>
								{mockInviteData.guild.description}
							</p>
							<div
								className={css({
									display: "flex",
									alignItems: "center",
									gap: "16px",
									fontSize: "sm",
									color: "text.medium",
								})}
							>
								<div
									className={css({
										display: "flex",
										alignItems: "center",
										gap: "4px",
									})}
								>
									<Users size={14} />
									<span>{mockInviteData.guild.memberCount}人</span>
								</div>
								<div
									className={css({
										display: "flex",
										alignItems: "center",
										gap: "4px",
									})}
								>
									<div
										className={css({
											width: "8px",
											height: "8px",
											borderRadius: "full",
											backgroundColor: "#10b981",
										})}
									/>
									<span>{mockInviteData.guild.onlineCount}人オンライン</span>
								</div>
							</div>
						</div>
					</div>

					{/* チャンネルプレビュー */}
					<div
						className={css({
							marginBottom: "24px",
						})}
					>
						<h3
							className={css({
								fontSize: "sm",
								fontWeight: "semibold",
								color: "text.bright",
								marginBottom: "12px",
							})}
						>
							チャンネル
						</h3>
						<div
							className={css({
								display: "flex",
								flexDirection: "column",
								gap: "8px",
							})}
						>
							{mockInviteData.channels.map((channel) => (
								<div
									key={channel.id}
									className={css({
										display: "flex",
										alignItems: "center",
										gap: "8px",
										padding: "8px 12px",
										background: "bg.quaternary",
										borderRadius: "md",
										fontSize: "sm",
										color: "text.medium",
									})}
								>
									<Hash size={16} />
									<span>{channel.name}</span>
								</div>
							))}
						</div>
					</div>

					{/* 招待詳細 */}
					<div
						className={css({
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							padding: "16px",
							background: "bg.quaternary",
							borderRadius: "md",
							marginBottom: "24px",
							fontSize: "sm",
						})}
					>
						<div
							className={css({
								display: "flex",
								alignItems: "center",
								gap: "4px",
								color: "text.medium",
							})}
						>
							<Calendar size={14} />
							<span>有効期限: {formatDate(mockInviteData.expiresAt)}</span>
						</div>
						<Badge variant="subtle">残り{getRemainingUses()}</Badge>
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
							className={css({
								width: "100%",
								fontSize: "md",
								fontWeight: "semibold",
							})}
						>
							{isJoining ? "参加中..." : `${mockInviteData.guild.name}に参加`}
						</Button>
						<Button
							variant="outline"
							onClick={() => navigate("/servers")}
							className={css({
								width: "100%",
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
