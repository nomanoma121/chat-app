import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Plus, Settings, UserRoundPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useOutletContext } from "react-router";
import { css } from "styled-system/css";
import * as v from "valibot";
import { useCreateCategory } from "~/api/gen/category/category";
import { useCreateChannel } from "~/api/gen/channel/channel";
import { Category } from "~/components/features/category";
import { Button } from "~/components/ui/button";
import { Dialog } from "~/components/ui/dialog";
import { Field } from "~/components/ui/field";
import { FormLabel } from "~/components/ui/form-label";
import { Heading } from "~/components/ui/heading";
import { IconButton } from "~/components/ui/icon-button";
import { useToast } from "~/hooks/use-toast";
import type { GuildsContext } from "../../layout";

const ChannelForm = v.object({
	name: v.pipe(
		v.string(),
		v.minLength(1, "チャンネル名は必須です"),
		v.maxLength(50, "チャンネル名は50文字以内で入力してください")
	),
});

const CategoryForm = v.object({
	name: v.pipe(
		v.string(),
		v.minLength(1, "カテゴリ名は必須です"),
		v.maxLength(30, "カテゴリ名は30文字以内で入力してください")
	),
});

type ChannelFormValues = v.InferInput<typeof ChannelForm>;
type CategoryFormValues = v.InferInput<typeof CategoryForm>;

export const GuildPanel = () => {
	const { guild, refetch } = useOutletContext<GuildsContext>();
	const { mutateAsync: createCategory, isPending: isCategoryPending } = useCreateCategory();
	const { mutateAsync: createChannel, isPending: isChannelPending } = useCreateChannel();
	const toast = useToast();

	const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);
	const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
	const [selectedCategoryId, setSelectedCategoryId] = useState("");
	const [isHovered, setIsHovered] = useState(false);
	const navigate = useNavigate();

	const channelForm = useForm<ChannelFormValues>({
		resolver: standardSchemaResolver(ChannelForm),
		mode: "onBlur",
		defaultValues: {
			name: "",
		},
	});

	const categoryForm = useForm<CategoryFormValues>({
		resolver: standardSchemaResolver(CategoryForm),
		mode: "onBlur",
		defaultValues: {
			name: "",
		},
	});

	const handleChannelSubmit = async (data: ChannelFormValues) => {
		try {
			await createChannel({
				categoryId: selectedCategoryId,
				data: {
					name: data.name,
				},
			});
			refetch();
			toast.success("チャンネルを作成しました");
			setIsChannelDialogOpen(false);
			channelForm.reset();
		} catch (error) {
			console.error("Channel creation error:", error);
			toast.error("チャンネルの作成に失敗しました");
		}
	};

	const handleCategorySubmit = async (data: CategoryFormValues) => {
		try {
			await createCategory({
				guildId: guild.id,
				data: {
					name: data.name,
				},
			});
			refetch();
			toast.success("カテゴリを作成しました");
			setIsCategoryDialogOpen(false);
			categoryForm.reset();
		} catch (error) {
			console.error("Category creation error:", error);
			toast.error("カテゴリの作成に失敗しました");
		}
	};

	return (
		<div
			className={css({
				color: "text.bright",
				width: "250px",
				bg: "bg.secondary",
			})}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<div
				className={css({
					borderBottomWidth: "1px",
					borderColor: "border.soft",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					paddingX: "5",
					height: "12",
				})}
			>
				<Heading
					className={css({
						fontSize: "sm",
						color: "text.medium",
					})}
					onClick={() => navigate(`/servers/${guild?.id}/settings`)}
				>
					{guild?.name}
				</Heading>
				<div className={css({ display: "flex", gap: "2" })}>
					<IconButton
						variant="ghost"
						size="sm"
						color="text.medium"
						className={css({
							_hover: {
								bgColor: "bg.tertiary",
								color: "text.bright",
							},
						})}
					>
						<UserRoundPlus
							size={16}
							onClick={() => navigate(`/servers/${guild?.id}/invite`)}
						/>
					</IconButton>
					<IconButton
						variant="ghost"
						size="sm"
						color="text.medium"
						className={css({
							_hover: {
								bgColor: "bg.tertiary",
								color: "text.bright",
							},
						})}
					>
						<Settings
							size={16}
							onClick={() => navigate(`/servers/${guild?.id}/settings`)}
						/>
					</IconButton>
				</div>
			</div>

			{guild?.categories?.map((category) => (
				<Category
					key={category.id}
					onAddChannel={() => {
						setIsChannelDialogOpen(true);
						setSelectedCategoryId(category.id);
					}}
				>
					<Category.Title>{category.name}</Category.Title>
					{category.channels.map((channel) => (
						<Category.Channel
							key={channel.id}
							channel={channel}
							onSelect={() =>
								navigate(`/servers/${guild.id}/channels/${channel.id}`)
							}
						/>
					))}
				</Category>
			))}

			{/* カテゴリ作成ボタン（ホバー時表示） */}
			<div
				className={css({
					padding: "4",
					marginTop: "4",
					opacity: isHovered ? 1 : 0,
					transition: isHovered ? "opacity 0.3s ease" : "opacity 0s",
					pointerEvents: isHovered ? "auto" : "none",
				})}
			>
				<button
					onClick={() => setIsCategoryDialogOpen(true)}
					className={css({
						display: "flex",
						alignItems: "center",
						gap: "2",
						width: "100%",
						padding: "2",
						fontSize: "xs",
						fontWeight: "medium",
						color: "text.medium",
						background: "transparent",
						border: "none",
						borderRadius: "sm",
						cursor: "pointer",
						transition: "all 0.1s ease",
						_hover: {
							color: "text.bright",
							backgroundColor: "bg.tertiary",
						},
					})}
				>
					<Plus size={14} />
					カテゴリを作成
				</button>
			</div>

			{/* チャンネル作成モーダル */}
			<Dialog.Root
				open={isChannelDialogOpen}
				onOpenChange={(e) => setIsChannelDialogOpen(e.open)}
			>
				<Dialog.Backdrop
					className={css({
						backgroundColor: "rgba(0, 0, 0, 0.7)",
					})}
				/>
				<Dialog.Positioner>
					<Dialog.Content
						className={css({
							background: "bg.secondary",
							borderRadius: "md",
							padding: "6",
							width: "400px",
							maxWidth: "90vw",
						})}
					>
						<Dialog.Title
							className={css({
								fontSize: "xl",
								fontWeight: "bold",
								color: "text.bright",
								marginBottom: "4",
							})}
						>
							チャンネルを作成
						</Dialog.Title>

						<form onSubmit={channelForm.handleSubmit(handleChannelSubmit)}>
							<div
								className={css({
									display: "flex",
									flexDirection: "column",
									gap: "4",
								})}
							>
								<Field.Root invalid={!!channelForm.formState.errors.name}>
									<FormLabel color="text.bright">チャンネル名</FormLabel>
									<Field.Input
										{...channelForm.register("name")}
										placeholder="チャンネル名を入力してください"
										className={css({
											background: "bg.primary",
											border: "none",
											color: "text.bright",
										})}
									/>
									{channelForm.formState.errors.name && (
										<Field.ErrorText>
											{channelForm.formState.errors.name.message}
										</Field.ErrorText>
									)}
								</Field.Root>

								<div
									className={css({
										display: "flex",
										gap: "3",
										justifyContent: "flex-end",
										marginTop: "4",
									})}
								>
									<Dialog.CloseTrigger asChild>
										<Button
											variant="outline"
											type="button"
											className={css({
												color: "text.bright",
												borderColor: "border.strong",
												backgroundColor: "bg.tertiary",
											})}
										>
											キャンセル
										</Button>
									</Dialog.CloseTrigger>
									<Button
										type="submit"
										disabled={!channelForm.formState.isValid || isChannelPending}
										loading={isChannelPending}
									>
										作成
									</Button>
								</div>
							</div>
						</form>
					</Dialog.Content>
				</Dialog.Positioner>
			</Dialog.Root>

			{/* カテゴリ作成モーダル */}
			<Dialog.Root
				open={isCategoryDialogOpen}
				onOpenChange={(e) => setIsCategoryDialogOpen(e.open)}
			>
				<Dialog.Backdrop
					className={css({
						backgroundColor: "rgba(0, 0, 0, 0.7)",
					})}
				/>
				<Dialog.Positioner>
					<Dialog.Content
						className={css({
							background: "bg.secondary",
							borderRadius: "md",
							padding: "6",
							width: "400px",
							maxWidth: "90vw",
						})}
					>
						<Dialog.Title
							className={css({
								fontSize: "xl",
								fontWeight: "bold",
								color: "text.bright",
								marginBottom: "4",
							})}
						>
							カテゴリを作成
						</Dialog.Title>

						<form onSubmit={categoryForm.handleSubmit(handleCategorySubmit)}>
							<div
								className={css({
									display: "flex",
									flexDirection: "column",
									gap: "4",
								})}
							>
								<Field.Root invalid={!!categoryForm.formState.errors.name}>
									<FormLabel color="text.bright">カテゴリ名</FormLabel>
									<Field.Input
										{...categoryForm.register("name")}
										placeholder="カテゴリ名を入力してください"
										className={css({
											background: "bg.primary",
											border: "none",
											color: "text.bright",
										})}
									/>
									{categoryForm.formState.errors.name && (
										<Field.ErrorText>
											{categoryForm.formState.errors.name.message}
										</Field.ErrorText>
									)}
								</Field.Root>

								<div
									className={css({
										display: "flex",
										gap: "3",
										justifyContent: "flex-end",
										marginTop: "4",
									})}
								>
									<Dialog.CloseTrigger asChild>
										<Button
											variant="outline"
											type="button"
											className={css({
												color: "text.bright",
												borderColor: "border.strong",
												backgroundColor: "bg.tertiary",
											})}
										>
											キャンセル
										</Button>
									</Dialog.CloseTrigger>
									<Button
										type="submit"
										disabled={!categoryForm.formState.isValid || isCategoryPending}
										loading={isCategoryPending}
									>
										作成
									</Button>
								</div>
							</div>
						</form>
					</Dialog.Content>
				</Dialog.Positioner>
			</Dialog.Root>
		</div>
	);
};
