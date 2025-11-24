import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { css } from "styled-system/css";
import * as v from "valibot";
import { MediaType } from "~/api/gen/guildTypeProto.schemas";
import { useGetPresignedUploadURL } from "~/api/gen/media/media";
import { useGetCurrentUser, useUpdate } from "~/api/gen/user/user";
import { Avatar } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Field } from "~/components/ui/field";
import { FormLabel } from "~/components/ui/form-label";
import { Spinner } from "~/components/ui/spinner";
import { Text } from "~/components/ui/text";
import { useToast } from "~/hooks/use-toast";
import { UserSchema } from "~/schema/user";

const ProfileForm = v.object({
	displayId: UserSchema.DisplayId,
	name: UserSchema.Name,
	bio: UserSchema.Bio,
	iconUrl: UserSchema.IconUrl,
});

type ProfileFormValues = v.InferInput<typeof ProfileForm>;

export const ProfileTab = () => {
	const toast = useToast();
	const { data, isLoading, refetch } = useGetCurrentUser();
	const { mutateAsync: updateUser, isPending } = useUpdate();
	const { mutateAsync: getPresignedUrl } = useGetPresignedUploadURL();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [iconUrl, setIconUrl] = useState<string | undefined>(undefined);
	const [isUploading, setIsUploading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfileFormValues>({
		resolver: standardSchemaResolver(ProfileForm),
		mode: "onSubmit",
		values: {
			displayId: data?.user.displayId || "",
			name: data?.user.name || "",
			bio: data?.user.bio || "",
			iconUrl: data?.user.iconUrl || "",
		},
	});

	const handleIconUpload = async (file: File) => {
		try {
			setIsUploading(true);
			const extension = file.name.split(".").pop() || "png";
			const { uploadUrl } = await getPresignedUrl({
				data: {
					filename: `${data?.user.id}.${extension}`,
					mediaType: MediaType.MEDIA_TYPE_USER_ICON,
				},
			});

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

			const url = new URL(uploadUrl);
			const publicUrl = `http://localhost:9001${url.pathname}?t=${Date.now()}`;
			setIconUrl(publicUrl);

			await updateUser({
				data: {
					displayId: data?.user.displayId || "",
					name: data?.user.name || "",
					bio: data?.user.bio || "",
					iconUrl: url.pathname.replace(/^\//, "http://localhost:9001/"),
				},
			});

			toast.success("アイコンをアップロードしました");
			await refetch();
		} catch (error) {
			console.error("アイコンのアップロード中にエラーが発生しました:", error);
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

	const onSubmit = async (formData: ProfileFormValues) => {
		try {
			await updateUser({
				data: {
					displayId: formData.displayId,
					name: formData.name,
					bio: formData.bio || "",
					iconUrl: iconUrl || formData.iconUrl || "",
				},
			});
			toast.success("プロフィール情報を更新しました");
			await refetch();
		} catch (error) {
			console.error("Profile update error:", error);
			toast.error("プロフィール情報の更新に失敗しました");
		}
	};

	if (isLoading) {
		return (
			<div
				className={css({
					height: "400px",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
				})}
			>
				<Spinner size="lg" />
				<Text className={css({ mt: "4", color: "text.medium" })}>
					プロフィール情報を読み込み中...
				</Text>
			</div>
		);
	}

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
					<h3
						className={css({
							fontSize: "lg",
							fontWeight: "semibold",
							color: "text.bright",
							marginBottom: "8px",
						})}
					>
						プロフィール情報
					</h3>
					<p
						className={css({
							fontSize: "sm",
							color: "text.medium",
							marginBottom: "16px",
						})}
					>
						あなたの基本的なプロフィール情報を管理できます
					</p>
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
								gap: "20px",
								marginBottom: "24px",
							})}
						>
							<div className={css({ position: "relative" })}>
								<Avatar
									name={data?.user.name || "ユーザー"}
									src={iconUrl || data?.user.iconUrl}
									size="xl"
									className={css({
										width: "80px",
										height: "80px",
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
							</div>
							<div className={css({ flex: 1 })}>
								<h3
									className={css({
										fontSize: "lg",
										fontWeight: "semibold",
										color: "text.bright",
										marginBottom: "4px",
									})}
								>
									{data?.user.name}
								</h3>
								<p
									className={css({
										fontSize: "sm",
										color: "text.medium",
										marginBottom: "12px",
									})}
								>
									参加日:{" "}
									{data?.user.createdAt
										? new Date(data.user.createdAt).toLocaleDateString()
										: "不明"}
								</p>
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
									size="sm"
									disabled={isUploading}
									loading={isUploading}
									onClick={handleIconButtonClick}
									className={css({
										display: "flex",
										alignItems: "center",
										bgColor: "bg.tertiary",
										color: "text.medium",
										_hover: !isUploading
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
									<Upload size={14} />
									{isUploading ? "アップロード中..." : "アイコン画像を変更"}
								</Button>
							</div>
						</div>

						<Field.Root invalid={!!errors.displayId}>
							<FormLabel color="text.bright">ユーザーID</FormLabel>
							<Field.Input
								{...register("displayId")}
								className={css({
									background: "bg.primary",
									border: "none",
									color: "text.bright",
								})}
							/>
							{errors.displayId && (
								<Field.ErrorText>{errors.displayId.message}</Field.ErrorText>
							)}
						</Field.Root>

						<Field.Root invalid={!!errors.name}>
							<FormLabel color="text.bright">ニックネーム</FormLabel>
							<Field.Input
								{...register("name")}
								className={css({
									background: "bg.primary",
									border: "none",
									color: "text.bright",
								})}
							/>
							{errors.name && (
								<Field.ErrorText>{errors.name.message}</Field.ErrorText>
							)}
						</Field.Root>

						<Field.Root invalid={!!errors.bio}>
							<FormLabel color="text.bright">自己紹介</FormLabel>
							<Field.Textarea
								{...register("bio")}
								rows={3}
								placeholder="あなたについて教えてください..."
								className={css({
									background: "bg.primary",
									border: "none",
									color: "text.bright",
									resize: "none",
								})}
							/>
							{errors.bio && (
								<Field.ErrorText>{errors.bio.message}</Field.ErrorText>
							)}
						</Field.Root>
						<div
							className={css({
								display: "flex",
								justifyContent: "flex-end",
								marginTop: "8px",
							})}
						>
							<Button type="submit" disabled={isPending} loading={isPending}>
								変更を保存
							</Button>
						</div>
					</form>
				</Card.Body>
			</Card.Root>
		</div>
	);
};
