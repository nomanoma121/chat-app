import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Settings, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { css } from "styled-system/css";
import * as v from "valibot";
import { useUpdateGuild } from "~/api/gen/guild/guild";
import {
	type GuildWithMembers,
	MediaType,
} from "~/api/gen/guildTypeProto.schemas";
import { useGetPresignedUploadURL } from "~/api/gen/media/media";
import { Avatar } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Field } from "~/components/ui/field";
import { FormLabel } from "~/components/ui/form-label";
import { Heading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";
import { usePermissions } from "~/hooks/use-permissions";
import { useToast } from "~/hooks/use-toast";
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
	const { mutateAsync: getPresignedUrl } = useGetPresignedUploadURL();
	const toast = useToast();
	const { canEditGuild } = usePermissions(guild);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<UpdateGuildFormValues>({
		resolver: standardSchemaResolver(UpdateGuildForm),
		mode: "onSubmit",
		defaultValues: {
			name: guild?.name,
			description: guild?.description,
		},
	});

	const handleIconUpload = async (file: File) => {
		try {
			setIsUploading(true);
			// ファイル拡張子を取得
			const extension = file.name.split(".").pop() || "png";
			const { uploadUrl } = await getPresignedUrl({
				data: {
					filename: `${guild.id}.${extension}`,
					mediaType: MediaType.MEDIA_TYPE_GUILD_ICON,
				},
			});

			console.log("uploadUrl:", uploadUrl);

			const uploadResponse = await fetch(uploadUrl, {
				method: "PUT",
				body: file,
				headers: {
					"Content-Type": file.type,
				},
			});

			if (!uploadResponse.ok) {
				throw new Error("Upload failed");
			}

			const uploadedUrl = uploadUrl.split("?")[0];

			await updateGuild({
				guildId: guild.id,
				data: {
					name: guild.name,
					description: guild.description || "",
					iconUrl: uploadedUrl,
					defaultChannelId: guild.defaultChannelId,
				},
			});
			toast.success("アイコンをアップロードしました");
		} catch (error) {
			console.log("error during icon upload:", error);
			toast.error("アイコンのアップロードに失敗しました");
		} finally {
			setIsUploading(false);
		}
	};

	const handleIconButtonClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleIconUpload(file);
		}
	};

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
						noValidate
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
								src={`${guild?.iconUrl}?t=${Date.now()}`}
								name={guild?.name || "サーバー"}
								size="lg"
								className={css({
									width: "64px",
									height: "64px",
									borderRadius: "50%",
									overflow: "hidden",
									"& img": {
										width: "100%",
										height: "100%",
										objectFit: "cover",
										aspectRatio: "1",
									},
								})}
							/>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								onChange={handleFileChange}
								className={css({ display: "none" })}
							/>
							<Button
								type="button"
								variant="outline"
								disabled={!canEditGuild || isUploading}
								onClick={handleIconButtonClick}
								loading={isUploading}
								className={css({
									display: "flex",
									alignItems: "center",
									bgColor: "bg.tertiary",
									color: "text.medium",
									_hover: canEditGuild
										? {
												bgColor: "bg.quaternary",
												color: "text.bright",
											}
										: {},
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
								{isUploading ? "アップロード中..." : "アイコンを変更"}
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
							disabled={!canEditGuild}
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
							_hover: canEditGuild
								? {
										bgColor: "danger.emphasized",
										color: "text.bright",
									}
								: {},
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
