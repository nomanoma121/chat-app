import { UserRoundPlus, Users } from "lucide-react";
import { useNavigate } from "react-router";
import { css } from "styled-system/css";
import type { GuildWithMembers } from "~/api/gen/guildTypeProto.schemas";
import { Avatar } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Heading } from "~/components/ui/heading";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";

interface MembersTabProps {
	guild?: GuildWithMembers;
}

export const MembersTab = ({ guild }: MembersTabProps) => {
	const navigate = useNavigate();
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
						<Users size={20} className={css({ marginRight: "8px" })} />
						メンバー管理
					</Heading>
					<Text
						className={css({
							fontSize: "sm",
							color: "text.medium",
							marginBottom: "16px",
						})}
					>
						サーバーのメンバーを管理できます
					</Text>
					<div
						className={css({
							display: "flex",
							gap: "8px",
							flexWrap: "wrap",
							marginBottom: "8px",
							justifyContent: "space-between",
						})}
					>
						<Input
							placeholder="メンバーを検索"
							size="md"
							className={css({
								flex: "1",
								minWidth: "200px",
								background: "bg.secondary",
								borderColor: "border.soft",
								color: "text.bright",
							})}
						/>
						<Button
							variant="solid"
							size="md"
							className={css({
								color: "text.bright",
							})}
							onClick={() => navigate("/servers/1/invite")}
						>
							<UserRoundPlus size={16} />
							新しいメンバーを招待
						</Button>
					</div>
				</Card.Header>
				<Card.Body>
					{guild?.members.map((member) => (
						<Card.Root
							key={member.userId}
							className={css({
								display: "flex",
								height: "20",
								bgColor: "bg.secondary",
								borderColor: "border.soft",
								borderWidth: "1px",
								borderRadius: "md",
								marginBottom: "8px",
							})}
						>
							<Card.Body
								className={css({
									display: "flex",
									flexDirection: "row",
									justifyContent: "space-between",
									alignItems: "center",
									height: "100%",
									padding: "0",
									paddingX: "6",
								})}
							>
								<div className={css({ display: "flex", alignItems: "center" })}>
									<Avatar
										name={member.nickname}
										src={""}
										size="sm"
										className={css({
											width: "32px",
											height: "32px",
											marginRight: "12px",
										})}
									/>
									<div
										className={css({
											display: "flex",
											alignItems: "center",
											flexDirection: "column",
										})}
									>
										<Text
											className={css({
												color: "text.bright",
											})}
											size="sm"
											fontWeight="medium"
										>
											{member.nickname}
										</Text>
										{member.userId === guild.ownerId ? (
											<Badge
												className={css({
													marginLeft: "8px",
													background: "accent.default",
													color: "text.bright",
													fontSize: "xs",
													fontWeight: "medium",
													borderRadius: "sm",
													border: "none",
												})}
												size="sm"
											>
												管理者
											</Badge>
										) : (
											<Badge
												className={css({
													marginLeft: "8px",
													background: "bg.tertiary",
													color: "text.medium",
													fontSize: "xs",
													fontWeight: "medium",
													borderRadius: "sm",
													border: "none",
												})}
												size="sm"
											>
												メンバー
											</Badge>
										)}
									</div>
								</div>
								<Button
									variant="outline"
									size="sm"
									className={css({ ml: "12px", color: "danger.default" })}
								>
									キック
								</Button>
							</Card.Body>
						</Card.Root>
					))}
				</Card.Body>
			</Card.Root>
		</div>
	);
};
