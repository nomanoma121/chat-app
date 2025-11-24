import {
	ArrowLeft,
	CheckIcon,
	ChevronsUpDownIcon,
	Copy,
	Link2,
	Plus,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { css } from "styled-system/css";
import { useGetGuildByID } from "~/api/gen/guild/guild";
import {
	useCreateGuildInvite,
	useGetGuildInvites,
} from "~/api/gen/invite/invite";
import { NotFoundPage } from "~/components/features/not-found-page";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { FormLabel } from "~/components/ui/form-label";
import { Heading } from "~/components/ui/heading";
import { IconButton } from "~/components/ui/icon-button";
import { NumberInput } from "~/components/ui/number-input";
import { createListCollection, Select } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Text } from "~/components/ui/text";
import { CLIENT_BASE_URL } from "~/constants";
import { usePermissions } from "~/hooks/use-permissions";
import { useToast } from "~/hooks/use-toast";
import { formatDate } from "~/utils";

const SECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const expiryDaysCollection = createListCollection({
	items: [
		{ label: "1日後", value: "1" },
		{ label: "7日後", value: "7" },
		{ label: "15日後", value: "15" },
		{ label: "30日後", value: "30" },
	],
});

export default function InvitePage() {
	const navigate = useNavigate();
	const { serverId: guildId } = useParams();
	const toast = useToast();
	if (!guildId) {
		return <NotFoundPage />;
	}
	const { data, refetch } = useGetGuildInvites(guildId);
	const { data: guildData } = useGetGuildByID(guildId);
	const { mutateAsync: createInvite } = useCreateGuildInvite();
	const { canCreateInvites } = usePermissions(guildData?.guild);
	const [inviteSettings, setInviteSettings] = useState({
		maxUses: {
			value: 10,
			isUnlimited: false,
		},
		expiryDays: {
			value: "7",
			isUnlimited: false,
		},
	});

	const handleCreateInvite = async () => {
		const expiresAt = new Date(
			Date.now() +
				parseInt(inviteSettings.expiryDays.value, 10) * SECONDS_PER_DAY,
		);
		try {
			await createInvite({
				guildId,
				data: {
					maxUses: inviteSettings.maxUses.isUnlimited
						? undefined
						: inviteSettings.maxUses.value,
					expiresAt: inviteSettings.expiryDays.isUnlimited
						? undefined
						: expiresAt.toISOString(),
				},
			});

			toast.success("招待リンクを作成しました");
			refetch();
		} catch {
			toast.error("招待リンクの作成に失敗しました");
		}
	};

	const handleCopyInvite = async (code: string) => {
		const inviteUrl = `${CLIENT_BASE_URL}/invite/${code}`;
		try {
			await navigator.clipboard.writeText(inviteUrl);
			toast.success("招待リンクをコピーしました");
		} catch {
			toast.error("招待リンクのコピーに失敗しました");
		}
	};

	// 権限がない場合は404を表示
	if (!canCreateInvites) {
		return <NotFoundPage />;
	}

	return (
		<div
			className={css({
				width: "800px",
				margin: "0 auto",
				background: "bg.primary",
				paddingY: "10",
				paddingBottom: "20",
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
				<Text className={css({ ml: "8px" })}>戻る</Text>
			</Button>

			<Heading
				className={css({ color: "text.bright", mt: "12px", mb: "20px" })}
				size="xl"
			>
				サーバー招待
			</Heading>

			{/* 新しい招待リンク作成 */}
			<Card.Root
				className={css({
					background: "bg.secondary",
					mb: "24px",
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
						<Plus size={20} className={css({ marginRight: "8px" })} />
						新しい招待リンクを作成
					</Heading>
					<Text
						className={css({
							fontSize: "sm",
							color: "text.medium",
							marginBottom: "16px",
						})}
					>
						招待リンクの設定を行い、新しい招待を作成します
					</Text>
				</Card.Header>

				<Card.Body
					className={css({
						display: "flex",
						flexDirection: "column",
						gap: "20px",
					})}
				>
					<div
						className={css({
							display: "flex",
							flexDirection: "row",
							gap: "16px",
						})}
					>
						<div
							className={css({
								width: "50%",
								display: "flex",
								flexDirection: "column",
								gap: "16px",
							})}
						>
							<Select.Root
								collection={expiryDaysCollection}
								positioning={{
									placement: "right",
									sameWidth: true,
									strategy: "absolute",
									flip: false,
								}}
								className={css({ width: "50%" })}
								defaultValue={["7"]}
								onValueChange={(details) =>
									setInviteSettings((prev) => ({
										...prev,
										expiryDays: {
											...prev.expiryDays,
											value: details.value[0],
										},
									}))
								}
							>
								<Select.Label className={css({ color: "text.bright" })}>
									有効期限
								</Select.Label>
								<Select.Control>
									<Select.Trigger color="text.bright">
										<Select.ValueText placeholder="有効期限を選択" />
										<ChevronsUpDownIcon />
									</Select.Trigger>
								</Select.Control>
								<Select.Positioner>
									<Select.Content
										className={css({
											color: "text.bright",
											bg: "bg.secondary",
											borderColor: "border.soft",
										})}
									>
										{expiryDaysCollection.items.map((item) => (
											<Select.Item
												key={item.value}
												item={item}
												className={css({
													_hover: {
														bg: "bg.tertiary",
														color: "text.bright",
													},
													_selected: {
														bg: "bg.tertiary",
														color: "text.bright",
													},
												})}
											>
												<Select.ItemText>
													<Text>{item.label}</Text>
												</Select.ItemText>
												<Select.ItemIndicator>
													<CheckIcon />
												</Select.ItemIndicator>
											</Select.Item>
										))}
									</Select.Content>
								</Select.Positioner>
							</Select.Root>
						</div>

						<div
							className={css({
								width: "50%",
							})}
						>
							<div
								className={css({
									display: "flex",
									flexDirection: "row",
									alignItems: "center",
									justifyContent: "flex-start",
									mb: "7px",
								})}
							>
								<FormLabel color="text.bright">使用回数制限</FormLabel>
								<Switch
									checked={inviteSettings.maxUses.isUnlimited}
									onCheckedChange={(details) =>
										setInviteSettings((prev) => ({
											...prev,
											maxUses: {
												...prev.maxUses,
												isUnlimited: details.checked,
											},
										}))
									}
									className={css({
										mx: "12px",
										"& [data-part='control']": {
											bg: "bg.quaternary",
											_checked: {
												bg: "accent.default",
											},
										},
									})}
								>
									<Text size="sm" className={css({ color: "text.bright" })}>
										無制限
									</Text>
								</Switch>
							</div>
							{!inviteSettings.maxUses.isUnlimited && (
								<NumberInput
									value={inviteSettings.maxUses.value.toString()}
									onValueChange={(details) =>
										setInviteSettings((prev) => ({
											...prev,
											maxUses: {
												value: details.valueAsNumber,
												isUnlimited: false,
											},
										}))
									}
									min={1}
									max={50}
									width="50%"
								/>
							)}
						</div>
					</div>

					<Button
						onClick={handleCreateInvite}
						className={css({ alignSelf: "flex-end" })}
					>
						招待リンクを作成
					</Button>
				</Card.Body>
			</Card.Root>

			{/* 既存の招待リンク */}
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
							justifyContent: "space-between",
						})}
					>
						<span className={css({ display: "flex", alignItems: "center" })}>
							<Link2 size={20} className={css({ marginRight: "8px" })} />
							既存の招待リンク ({data?.invites.length})
						</span>
					</Heading>
				</Card.Header>

				<Card.Body className={css({ padding: "0" })}>
					{data?.invites.map((invite) => (
						<div
							key={invite.inviteCode}
							className={css({
								padding: "20px",
							})}
						>
							<div
								className={css({
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
								})}
							>
								<div className={css({ flex: 1 })}>
									<div
										className={css({
											display: "flex",
											alignItems: "center",
											gap: "12px",
											mb: "8px",
										})}
									>
										<Text
											className={css({
												fontFamily: "mono",
												fontSize: "lg",
												fontWeight: "semibold",
												color: "text.bright",
												background: "bg.quaternary",
												padding: "4px 8px",
												borderRadius: "sm",
											})}
										>
											{invite.inviteCode}
										</Text>
										<Badge
											className={css({
												background:
													invite.currentUses >= (invite.maxUses || 999)
														? "danger.default"
														: "accent.default",
												color: "text.bright",
											})}
										>
											{invite.currentUses}回使用
										</Badge>
									</div>

									<div
										className={css({
											display: "flex",
											flexDirection: "column",
											gap: "4px",
										})}
									>
										<Text
											className={css({ fontSize: "sm", color: "text.medium" })}
										>
											作成者: {invite.creator?.name}
										</Text>
										<Text
											className={css({ fontSize: "sm", color: "text.medium" })}
										>
											作成日: {formatDate(invite.createdAt)}
										</Text>
										<Text
											className={css({
												fontSize: "sm",
												color: "text.medium",
											})}
										>
											期限:
											{invite.expiresAt
												? formatDate(invite.expiresAt)
												: "無期限"}
										</Text>

										<Text
											className={css({
												fontSize: "sm",
												color: "text.medium",
											})}
										>
											使用回数制限: {invite.maxUses ? invite.maxUses : "なし"}
										</Text>
									</div>
								</div>

								<div
									className={css({
										display: "flex",
										gap: "8px",
										alignItems: "center",
									})}
								>
									<IconButton
										variant="outline"
										size="sm"
										onClick={() => handleCopyInvite(invite.inviteCode)}
										className={css({
											display: "flex",
											alignItems: "center",
											gap: "6px",
											color: "text.medium",
											borderColor: "border.soft",
											_hover: {
												background: "bg.quaternary",
												color: "text.bright",
											},
										})}
									>
										<Copy size={14} />
									</IconButton>
									<IconButton
										variant="outline"
										size="sm"
										onClick={() => {}}
										className={css({
											display: "flex",
											alignItems: "center",
											gap: "6px",
											color: "danger.default",
											borderColor: "danger.default",
											_hover: {
												background: "danger.default",
												color: "text.bright",
											},
										})}
									>
										<Trash2 size={14} />
									</IconButton>
								</div>
							</div>
						</div>
					))}
				</Card.Body>
			</Card.Root>
		</div>
	);
}
