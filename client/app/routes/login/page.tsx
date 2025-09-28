import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, Link } from "react-router";
import { css } from "styled-system/css";
import * as v from "valibot";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Field } from "~/components/ui/field";
import { FormLabel } from "~/components/ui/form-label";
import { useLogin } from "~/hooks/use-login";
import { useToast } from "~/hooks/use-toast";
import { UserSchema } from "~/schema/user";

const LoginForm = v.object({
	email: UserSchema.Email,
	password: UserSchema.Password,
});

type FormInputValues = v.InferInput<typeof LoginForm>;

export default function LoginPage() {
	const navigate = useNavigate();
	const { mutateAsync, isPending, error } = useLogin();
	const toast = useToast();
	const location = useLocation();
	
	const searchParams = new URLSearchParams(location.search);
	const redirectState = searchParams.get("state");

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
			await mutateAsync({
				email: data.email,
				password: data.password,
			});
			toast.success("ログインしました");
			if (redirectState) {
				navigate(`/invite/${redirectState.replace("invite:", "")}`);
			} else {
				navigate("/servers");
			}
		} catch (_error) {
			toast.error(
				"ログインに失敗しました",
				"メールアドレスまたはパスワードを確認してください",
			);
		}
	};

	return (
		<div
			className={css({
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "bg.primary",
				padding: "20px",
			})}
		>
			<Card.Root
				className={css({
					width: "400px",
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
							<Link
								to={
									redirectState
										? `/register?state=${redirectState}`
										: "/register"
								}
								className={css({
									fontWeight: "medium",
									color: "accent.default",
									_hover: {
										color: "accent.emphasized",
									},
								})}
							>
								新規登録はこちら
							</Link>
						</div>
					</form>
				</Card.Body>
			</Card.Root>
		</div>
	);
}
