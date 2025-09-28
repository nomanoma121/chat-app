import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Settings, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { css } from "styled-system/css";
import * as v from "valibot";
import { useUpdateGuild } from "~/api/gen/guild/guild";
import type { GuildWithMembers } from "~/api/gen/guildTypeProto.schemas";
import { Avatar } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Field } from "~/components/ui/field";
import { FormLabel } from "~/components/ui/form-label";
import { Heading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";
import { useToast } from "~/hooks/use-toast";
import { usePermissions } from "~/hooks/use-permissions";
import { GuildSchema } from "~/schema/guild";

interface GeneralTabProps {
	guild: GuildWithMembers;
}

const UpdateGuildForm = v.object({
	name: GuildSchema.Name,
	description: GuildSchema.Description,
});

type UpdateGuildFormValues = v.InferInput<typeof UpdateGuildForm>;

export const GeneralTab = ({ guild }: GeneralTabProps) => {
	const { mutateAsync: updateGuild } = useUpdateGuild();
	const toast = useToast();
	const { canEditGuild } = usePermissions(guild);
	const {
		register,
		handleSubmit,
		formState: { isValid, errors },
	} = useForm<UpdateGuildFormValues>({
		resolver: standardSchemaResolver(UpdateGuildForm),
		mode: "onBlur",
		defaultValues: {
			name: guild?.name,
			description: guild?.description,
		},
	});

	const onSubmit = async (data: UpdateGuildFormValues) => {
		try {
			await updateGuild({
				guildId: guild.id,
				data: {
					name: data.name,
					description: data.description || "",
					iconUrl: guild.iconUrl,
					defaultChannelId: guild.defaultChannelId,
				},
			});
			toast.success("サーバー情報を更新しました");
		} catch (error) {
			console.error("サーバー情報の更新中にエラーが発生しました:", error);
			toast.error("サーバー情報の更新に失敗しました");
		}
	};

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

				<Card.Body>
					<form
						onSubmit={handleSubmit(onSubmit)}
						className={css({
							display: "flex",
							flexDirection: "column",
							gap: "20px",
						})}
					>
						<div
							className={css({
								display: "flex",
								alignItems: "center",
								gap: "16px",
							})}
						>
							<Avatar
								name={guild?.name || "サーバー"}
								size="lg"
								className={css({
									width: "64px",
									height: "64px",
								})}
							/>
							<Button
								type="button"
								variant="outline"
								disabled={!canEditGuild}
								className={css({
									display: "flex",
									alignItems: "center",
									bgColor: "bg.tertiary",
									color: "text.medium",
									_hover: canEditGuild ? {
										bgColor: "bg.quaternary",
										color: "text.bright",
									} : {},
									_disabled: {
										opacity: 0.5,
										cursor: "not-allowed",
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

						<Field.Root invalid={!!errors.name}>
							<FormLabel color="text.bright">サーバー名</FormLabel>
							<Field.Input
								{...register("name")}
								disabled={!canEditGuild}
								className={css({
									borderColor: "border.soft",
									color: "text.bright",
									_disabled: {
										opacity: 0.6,
										cursor: "not-allowed",
									},
								})}
							/>
							{errors.name && (
								<Field.ErrorText>{errors.name.message}</Field.ErrorText>
							)}
						</Field.Root>

						<Field.Root invalid={!!errors.description}>
							<FormLabel color="text.bright">サーバー説明</FormLabel>
							<Field.Textarea
								{...register("description")}
								disabled={!canEditGuild}
								rows={3}
								className={css({
									borderColor: "border.soft",
									color: "text.bright",
									resize: "none",
									_disabled: {
										opacity: 0.6,
										cursor: "not-allowed",
									},
								})}
							/>
							{errors.description && (
								<Field.ErrorText>{errors.description.message}</Field.ErrorText>
							)}
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
							type="submit"
							disabled={!isValid || !canEditGuild}
							className={css({
								marginTop: "8px",
								alignSelf: "flex-end",
								_disabled: {
									opacity: 0.5,
									cursor: "not-allowed",
								},
							})}
						>
							変更を保存
						</Button>
					</form>
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
						disabled={!canEditGuild}
						className={css({
							color: "text.bright",
							bgColor: "danger.default",
							_hover: canEditGuild ? {
								bgColor: "danger.emphasized",
								color: "text.bright",
							} : {},
							_disabled: {
								opacity: 0.5,
								cursor: "not-allowed",
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
