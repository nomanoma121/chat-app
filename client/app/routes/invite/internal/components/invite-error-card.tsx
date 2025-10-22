import { css } from "styled-system/css";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Text } from "~/components/ui/text";

export const InviteErrorCard = ({
	navigate,
}: {
	navigate: (path: string) => void;
}) => (
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
						lineHeight: "1.5",
						whiteSpace: "nowrap",
					})}
				>
					この招待リンクは無効か削除されています
				</Text>
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
