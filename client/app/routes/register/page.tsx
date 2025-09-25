import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { css } from "styled-system/css";
import * as v from "valibot";
import { useRegister } from "~/api/gen/auth/auth";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Field } from "~/components/ui/field";
import { FormLabel } from "~/components/ui/form-label";
import { Spinner } from "~/components/ui/spinner";
import { useLogin } from "~/hooks/use-login";
import { UserSchema } from "~/schema/user";

const RegisterForm = v.object({
	displayId: UserSchema.DisplayId,
	name: UserSchema.Name,
	email: UserSchema.Email,
	password: UserSchema.Password,
	bio: UserSchema.Bio,
	iconUrl: UserSchema.IconUrl,
});

type FormInputValues = v.InferInput<typeof RegisterForm>;

export default function RegisterPage() {
	const navigate = useNavigate();
	const { mutateAsync: register, isPending, error } = useRegister();
	const { mutateAsync: login } = useLogin();

	const {
		register: registerField,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<FormInputValues>({
		resolver: standardSchemaResolver(RegisterForm),
		mode: "onBlur",
		defaultValues: {
			displayId: "",
			name: "",
			email: "",
			password: "",
			bio: "",
			iconUrl: "",
		},
	});

	const onSubmit = async (data: FormInputValues) => {
		try {
			await register({ data });
			await login({
				data: { email: data.email, password: data.password },
			});
			navigate("/servers");
		} catch (_error) {
			console.log(_error);
		}
	};

	return (
		<div>
			<Card.Root
				className={css({
					width: "500px",
					margin: "0 auto",
					marginTop: "80px",
					padding: "30px",
					background: "bg.secondary",
				})}
			>
				<Card.Header>
					<h1
						className={css({
							fontSize: "2xl",
							fontWeight: "bold",
							textAlign: "center",
							color: "text.bright",
						})}
					>
						新規登録
					</h1>
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
						<Field.Root invalid={!!errors.displayId}>
							<FormLabel color="text.bright">ユーザーID</FormLabel>
							<Field.Input
								{...registerField("displayId")}
								type="text"
								placeholder="例: user123"
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
								{...registerField("name")}
								type="text"
								placeholder="例: 太郎"
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

						<Field.Root invalid={!!errors.email}>
							<FormLabel color="text.bright">メールアドレス</FormLabel>
							<Field.Input
								{...registerField("email")}
								type="email"
								autoComplete="email"
								placeholder="例: user@example.com"
								className={css({
									background: "bg.primary",
									border: "none",
									color: "text.bright",
								})}
							/>
							{errors.email && (
								<Field.ErrorText>{errors.email.message}</Field.ErrorText>
							)}
						</Field.Root>

						<Field.Root invalid={!!errors.password}>
							<FormLabel color="text.bright">パスワード</FormLabel>
							<Field.Input
								{...registerField("password")}
								type="password"
								autoComplete="new-password"
								placeholder="パスワードを入力してください"
								className={css({
									background: "bg.primary",
									border: "none",
									color: "text.bright",
								})}
							/>
							{errors.password && (
								<Field.ErrorText>{errors.password.message}</Field.ErrorText>
							)}
						</Field.Root>

						<Field.Root invalid={!!errors.bio}>
							<FormLabel color="text.bright">自己紹介（任意）</FormLabel>
							<Field.Textarea
								{...registerField("bio")}
								rows={3}
								placeholder="自己紹介文を入力してください"
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

						<Field.Root invalid={!!errors.iconUrl}>
							<FormLabel color="text.bright">アイコンURL（任意）</FormLabel>
							<Field.Input
								{...registerField("iconUrl")}
								type="url"
								placeholder="https://example.com/icon.jpg"
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

						{error && (
							<div
								className={css({
									color: "accent.default",
									fontSize: "sm",
									textAlign: "center",
									padding: "2",
									bg: "bg.tertiary",
									borderRadius: "md",
								})}
							>
								登録に失敗しました。入力内容を確認してください。
							</div>
						)}

						<Button
							type="submit"
							disabled={!isValid || isPending}
							loading={isPending}
							className={css({
								width: "100%",
								marginTop: "10px",
							})}
						>
							新規登録
						</Button>

						<div
							className={css({
								textAlign: "center",
								marginTop: "4",
							})}
						>
							<a
								href="/login"
								className={css({
									fontWeight: "medium",
									color: "accent.default",
									_hover: {
										color: "accent.emphasized",
									},
								})}
							>
								ログインはこちら
							</a>
						</div>
					</form>
				</Card.Body>
			</Card.Root>
		</div>
	);
}
