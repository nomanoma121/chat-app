import { MessageSquare, Shield, Users, Zap } from "lucide-react";
import { useNavigate } from "react-router";
import { css } from "styled-system/css";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

const features = [
	{
		icon: MessageSquare,
		title: "リアルタイムチャット",
		description: "友達やチームメンバーとリアルタイムでメッセージを交換できます",
	},
	{
		icon: Users,
		title: "サーバー管理",
		description: "自分のコミュニティを作成し、メンバーを招待して管理できます",
	},
	{
		icon: Shield,
		title: "セキュア",
		description: "あなたのメッセージとプライベートデータを安全に保護します",
	},
	{
		icon: Zap,
		title: "高速",
		description: "最新の技術スタックで構築された高速で安定したプラットフォーム",
	},
];

export default function Home() {
	const navigate = useNavigate();

	return (
		<div
			className={css({
				minHeight: "100vh",
				background: "bg.primary",
			})}
		>
			{/* ヒーロセクション */}
			<div
				className={css({
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					minHeight: "70vh",
					padding: "20px",
					textAlign: "center",
				})}
			>
				<h1
					className={css({
						fontSize: { base: "3xl", md: "5xl" },
						fontWeight: "bold",
						color: "text.bright",
						marginBottom: "24px",
						lineHeight: "1.2",
					})}
				>
					新しいコミュニケーション
					<br />
					<span className={css({ color: "accent.default" })}>体験</span>
				</h1>

				<p
					className={css({
						fontSize: { base: "lg", md: "xl" },
						color: "text.medium",
						marginBottom: "40px",
						maxWidth: "600px",
						lineHeight: "1.6",
					})}
				>
					チームやコミュニティとつながり、リアルタイムでコミュニケーションを取りましょう。
					シンプルで使いやすいチャットプラットフォーム。
				</p>

				<div
					className={css({
						display: "flex",
						gap: "16px",
						flexWrap: "wrap",
						justifyContent: "center",
					})}
				>
					<Button
						size="lg"
						onClick={() => navigate("/signup")}
						className={css({
							fontSize: "lg",
							padding: "16px 32px",
						})}
					>
						今すぐ始める
					</Button>
					<Button
						variant="outline"
						size="lg"
						onClick={() => navigate("/login")}
						className={css({
							fontSize: "lg",
							padding: "16px 32px",
							color: "text.bright",
							borderColor: "border.default",
							_hover: {
								background: "bg.tertiary",
							},
						})}
					>
						ログイン
					</Button>
				</div>
			</div>

			{/* 機能セクション */}
			<div
				className={css({
					padding: "80px 20px",
					background: "bg.secondary",
				})}
			>
				<div
					className={css({
						maxWidth: "1200px",
						margin: "0 auto",
					})}
				>
					<h2
						className={css({
							fontSize: "3xl",
							fontWeight: "bold",
							color: "text.bright",
							textAlign: "center",
							marginBottom: "16px",
						})}
					>
						なぜ選ばれるのか
					</h2>
					<p
						className={css({
							fontSize: "lg",
							color: "text.medium",
							textAlign: "center",
							marginBottom: "64px",
							maxWidth: "600px",
							margin: "0 auto 64px",
						})}
					>
						現代的なデザインと強力な機能で、コミュニケーションをもっと楽しく、効率的に。
					</p>

					<div
						className={css({
							display: "grid",
							gridTemplateColumns: {
								base: "1fr",
								md: "repeat(2, 1fr)",
								lg: "repeat(4, 1fr)",
							},
							gap: "32px",
						})}
					>
						{features.map((feature, index) => (
							<Card.Root
								key={index}
								className={css({
									background: "bg.tertiary",
									padding: "32px 24px",
									textAlign: "center",
									border: "1px solid",
									borderColor: "border.soft",
									_hover: {
										borderColor: "accent.default",
										transform: "translateY(-4px)",
										transition: "all 0.2s ease",
									},
								})}
							>
								<Card.Body>
									<feature.icon
										className={css({
											width: "48px",
											height: "48px",
											color: "accent.default",
											margin: "0 auto 16px",
										})}
									/>
									<h3
										className={css({
											fontSize: "lg",
											fontWeight: "semibold",
											color: "text.bright",
											marginBottom: "12px",
										})}
									>
										{feature.title}
									</h3>
									<p
										className={css({
											color: "text.medium",
											lineHeight: "1.5",
										})}
									>
										{feature.description}
									</p>
								</Card.Body>
							</Card.Root>
						))}
					</div>
				</div>
			</div>

			{/* CTAセクション */}
			<div
				className={css({
					padding: "80px 20px",
					textAlign: "center",
				})}
			>
				<h2
					className={css({
						fontSize: "2xl",
						fontWeight: "bold",
						color: "text.bright",
						marginBottom: "16px",
					})}
				>
					今すぐ参加しましょう
				</h2>
				<p
					className={css({
						fontSize: "lg",
						color: "text.medium",
						marginBottom: "32px",
					})}
				>
					アカウント作成は無料です。数分で始められます。
				</p>
				<Button
					size="lg"
					onClick={() => navigate("/signup")}
					className={css({
						fontSize: "lg",
						padding: "16px 40px",
					})}
				>
					無料でアカウント作成
				</Button>
			</div>
		</div>
	);
}
