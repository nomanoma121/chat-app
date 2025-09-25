import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { css } from "styled-system/css";
import * as v from "valibot";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Field } from "~/components/ui/field";
import { FormLabel } from "~/components/ui/form-label";
import { Spinner } from "~/components/ui/spinner";
import { useLogin } from "~/hooks/use-login";
import { UserSchema } from "~/schema/user";

const LoginForm = v.object({
	email: UserSchema.Email,
	password: UserSchema.Password,
});

type FormInputValues = v.InferInput<typeof LoginForm>;

export default function LoginPage() {
	const navigate = useNavigate();
	const { mutateAsync, isPending, error } = useLogin();

	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
	} = useForm<FormInputValues>({
		resolver: standardSchemaResolver(LoginForm),
		mode: "onBlur",
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const onSubmit = async (data: FormInputValues) => {
		try {
			await mutateAsync({ data });
			navigate("/servers");
		} catch (_error) {
			// エラーはerror stateで表示される
		}
	};

	return (
		<div>
			<Card.Root
				className={css({
					width: "400px",
					margin: "0 auto",
					marginTop: "100px",
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
						ログイン
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
						<Field.Root invalid={!!errors.email}>
							<FormLabel color="text.bright">メールアドレス</FormLabel>
							<Field.Input
								{...register("email")}
								type="email"
								autoComplete="email"
								placeholder="メールアドレスを入力してください"
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
								{...register("password")}
								type="password"
								autoComplete="current-password"
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
								ログインに失敗しました。メールアドレスまたはパスワードを確認してください。
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
							ログイン
						</Button>

						<div
							className={css({
								textAlign: "center",
								marginTop: "4",
							})}
						>
							<a
								href="/register"
								className={css({
									fontWeight: "medium",
									color: "accent.default",
									_hover: {
										color: "accent.emphasized",
									},
								})}
							>
								新規登録はこちら
							</a>
						</div>
					</form>
				</Card.Body>
			</Card.Root>
		</div>
	);
}
