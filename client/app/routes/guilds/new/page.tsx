import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { css } from "styled-system/css";
import * as v from "valibot";
import { useCreateGuild } from "~/api/gen/guild/guild";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Field } from "~/components/ui/field";
import { FormLabel } from "~/components/ui/form-label";
import { useToast } from "~/hooks/use-toast";
import { GuildSchema } from "~/schema/guild";

const CreateGuildForm = v.object({
	name: GuildSchema.Name,
	description: GuildSchema.Description,
	iconUrl: GuildSchema.IconUrl,
});

type FormInputValues = v.InferInput<typeof CreateGuildForm>;

export default function CreateGuild() {
	const navigate = useNavigate();
	const { mutateAsync, isPending } = useCreateGuild();
	const toast = useToast();

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<FormInputValues>({
		resolver: standardSchemaResolver(CreateGuildForm),
		mode: "onSubmit",
		defaultValues: {
			name: "",
			description: "",
			iconUrl: "",
		},
	});

	const onSubmit = async (data: FormInputValues) => {
		try {
			const result = await mutateAsync({
				data: {
					name: data.name,
					description: data.description ?? "",
					iconUrl: data.iconUrl,
				},
			});
			reset();
			toast.success("サーバーを作成しました");
			navigate(
				`/servers/${result.guild.id}/channels/${result.guild.defaultChannelId}`,
			);
		} catch (error) {
			console.error("Error creating guild:", error);
			toast.error("サーバーの作成に失敗しました", "入力内容を確認してください");
		}
	};

	return (
		<div>
			<Card.Root
				className={css({
					width: "500px",
					margin: "0 auto",
					marginTop: "70px",
					padding: "20px",
					background: "bg.secondary",
				})}
			>
				<Card.Header>
					<h1
						className={css({
							fontSize: "2xl",
							fontWeight: "bold",
						})}
					>
						新しいサーバーを作成
					</h1>
				</Card.Header>
				<Card.Body
					className={css({
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: "20px",
					})}
				>
					<form
						onSubmit={handleSubmit(onSubmit)}
						noValidate
						className={css({
							width: "100%",
							display: "flex",
							flexDirection: "column",
							gap: "20px",
						})}
					>
						<Field.Root
							className={css({ width: "100%" })}
							invalid={!!errors.name}
						>
							<FormLabel color="text.bright">サーバー名</FormLabel>
							<Field.Input
								{...register("name")}
								placeholder="サーバー名を入力してください"
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
						<Field.Root
							className={css({ width: "100%" })}
							invalid={!!errors.description}
						>
							<FormLabel color="text.bright">サーバーの説明</FormLabel>
							<Field.Textarea
								{...register("description")}
								placeholder="サーバーの説明を入力してください"
								className={css({
									background: "bg.primary",
									border: "none",
									resize: "none",
								})}
							/>
							{errors.description && (
								<Field.ErrorText>{errors.description.message}</Field.ErrorText>
							)}
						</Field.Root>
						<Field.Root
							className={css({ width: "100%" })}
							invalid={!!errors.iconUrl}
						>
							<FormLabel color="text.bright">アイコンURL</FormLabel>
							<Field.Input
								{...register("iconUrl")}
								placeholder="https://example.com/icon.png"
								className={css({
									background: "bg.primary",
									border: "none",
									color: "text.bright",
								})}
							/>
							{errors.iconUrl && (
								<Field.ErrorText>{errors.iconUrl.message}</Field.ErrorText>
							)}
						</Field.Root>
						<Button
							type="submit"
							className={css({ width: "100%", marginTop: "10px" })}
							loading={isPending}
							disabled={isPending}
						>
							サーバーを作成
						</Button>
					</form>
				</Card.Body>
			</Card.Root>
		</div>
	);
}
