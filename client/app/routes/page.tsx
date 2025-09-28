import { useNavigate } from "react-router";
import { css } from "styled-system/css";
import { Button } from "~/components/ui/button";
import { Github } from "lucide-react";
import { Text } from "~/components/ui/text";
import { Heading } from "~/components/ui/heading";
import { Link } from "react-router";

export default function Home() {
	const navigate = useNavigate();

	return (
		<div
			className={css({
				height: "100vh",
				background: "bg.primary",
				display: "flex",
				flexDirection: "column",
			})}
		>
			<div
				className={css({
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					flex: "1",
					padding: "20px",
					textAlign: "center",
				})}
			>
				<Heading
					className={css({
						fontSize: { base: "2xl", md: "3xl" },
						fontWeight: "bold",
						color: "text.bright",
						marginBottom: "16px",
					})}
				>
					チャットアプリ
				</Heading>

				<Text
					className={css({
						fontSize: "sm",
						color: "text.disabled",
						marginBottom: "32px",
					})}
				>
					このサイトは勉強用に作成されたものであり、実際のサービスではありません。
				</Text>

				<Text 
					className={css({
						fontSize: "medium",
						color: "text.medium",
						marginBottom: "16px",
					})}
				>
					<Github
						size={16}
						className={css({
							display: "inline",
							verticalAlign: "middle",
							marginRight: "8px",
						})}
					/>
					リポジトリは
					<Link
						className={css({
							color: "accent.default",
							marginLeft: "4px",
							textDecoration: "underline",
						})}
						to="https://github.com/nomanoma121/chat-app"
						target="_blank"
						rel="noopener noreferrer">こちら</Link>
					</Text>

				<div
					className={css({
						display: "flex",
						gap: "12px",
						flexWrap: "wrap",
						justifyContent: "center",
					})}
				>
					<Button
						onClick={() => navigate("/register")}
						className={css({
							padding: "12px 24px",
						})}
					>
						新規登録
					</Button>
					<Button
						variant="outline"
						onClick={() => navigate("/login")}
						className={css({
							padding: "12px 24px",
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

			<div
				className={css({
					background: "bg.tertiary",
					borderTop: "1px solid",
					borderColor: "border.soft",
					padding: "12px 20px",
					textAlign: "center",
				})}
			>
				<p
					className={css({
						fontSize: "xs",
						color: "text.disabled",
					})}
				>
					© 2025 nomanoma121 All rights reserved.
				</p>
			</div>
		</div>
	);
}
