import { Settings, Upload } from "lucide-react";
import { css } from "styled-system/css";
import type { GuildWithMembers } from "~/api/gen/guildTypeProto.schemas";
import { Avatar } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Field } from "~/components/ui/field";
import { FormLabel } from "~/components/ui/form-label";
import { Heading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";

interface GeneralTabProps {
	guild?: GuildWithMembers;
}

export const GeneralTab = ({ guild }: GeneralTabProps) => {
	return (
		<div
			className={css({
				display: "flex",
				flexDirection: "column",
			})}
		>
			<Card.Root
				className={css({
					background: "bg.secondary",
				})}
			>
				<Card.Header>
					<Heading
						className={css({
							fontSize: "lg",
							fontWeight: "semibold",
							color: "text.bright",
							marginBottom: "8px",
							display: "flex",
							alignItems: "center",
						})}
					>
						<Settings size={20} className={css({ marginRight: "8px" })} />
						<Text className={css({ marginRight: "8px" })}>サーバー管理</Text>
					</Heading>
					<Text
						className={css({
							fontSize: "sm",
							color: "text.medium",
							marginBottom: "16px",
						})}
					>
						サーバーの基本情報を編集できます
					</Text>
				</Card.Header>

				<Card.Body
					className={css({
						display: "flex",
						flexDirection: "column",
						gap: "20px",
					})}
				>
					{/* サーバーアイコン */}
					<div
						className={css({
							display: "flex",
							alignItems: "center",
							gap: "16px",
						})}
					>
						<Avatar
							name="開発チーム"
							size="lg"
							className={css({
								width: "64px",
								height: "64px",
							})}
						/>
						<Button
							variant="outline"
							className={css({
								display: "flex",
								alignItems: "center",
								bgColor: "bg.tertiary",
								color: "text.medium",
								_hover: {
									bgColor: "bg.quaternary",
									color: "text.bright",
								},
								paddingX: "12px",
								paddingY: "8px",
								fontSize: "sm",
								gap: "8px",
							})}
						>
							<Upload size={16} />
							アイコンを変更
						</Button>
					</div>

					{/* サーバー名 */}
					<Field.Root>
						<FormLabel color="text.bright">サーバー名</FormLabel>
						<Field.Input
							defaultValue={guild?.name}
							className={css({
								borderColor: "border.soft",
								color: "text.bright",
							})}
						/>
					</Field.Root>

					<Field.Root>
						<FormLabel color="text.bright">サーバー説明</FormLabel>
						<Field.Textarea
							defaultValue={guild?.description}
							rows={3}
							className={css({
								borderColor: "border.soft",
								color: "text.bright",
								resize: "none",
							})}
						/>
					</Field.Root>

					<div
						className={css({
							display: "grid",
							gridTemplateColumns: "repeat(2, 1fr)",
							gap: "16px",
							marginTop: "8px",
						})}
					>
						<div
							className={css({
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								padding: "16px",
							})}
						>
							<span
								className={css({
									fontSize: "2xl",
									fontWeight: "bold",
									color: "accent.default",
								})}
							>
								{guild?.memberCount}
							</span>
							<span
								className={css({
									fontSize: "sm",
									color: "text.medium",
								})}
							>
								メンバー数
							</span>
						</div>
						<div
							className={css({
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								padding: "16px",
							})}
						>
							<span
								className={css({
									fontSize: "2xl",
									fontWeight: "bold",
									color: "text.bright",
								})}
							>
								{new Date(guild?.createdAt ?? "").toLocaleDateString()}
							</span>
							<span
								className={css({
									fontSize: "sm",
									color: "text.medium",
								})}
							>
								作成日
							</span>
						</div>
					</div>

					<Button
						className={css({
							marginTop: "8px",
							alignSelf: "flex-end",
						})}
					>
						変更を保存
					</Button>
				</Card.Body>
			</Card.Root>

			<Card.Root
				className={css({
					background: "bg.secondary",
					marginY: "24px",
				})}
			>
				<Card.Header>
					<h3
						className={css({
							fontSize: "lg",
							fontWeight: "semibold",
							color: "danger.default",
							marginBottom: "8px",
						})}
					>
						危険な操作
					</h3>
					<p
						className={css({
							fontSize: "sm",
							color: "text.medium",
							marginBottom: "16px",
						})}
					>
						これらの操作は元に戻せません
					</p>
				</Card.Header>

				<Card.Body>
					<Button
						variant="outline"
						className={css({
							color: "text.bright",
							bgColor: "danger.default",
							_hover: {
								bgColor: "danger.emphasized",
								color: "text.bright",
							},
							alignSelf: "flex-end",
						})}
					>
						サーバーを削除
					</Button>
				</Card.Body>
			</Card.Root>
		</div>
	);
};
