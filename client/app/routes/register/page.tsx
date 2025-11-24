import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import { css } from "styled-system/css";
import * as v from "valibot";
import { useAuthMe, useRegister } from "~/api/gen/auth/auth";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Field } from "~/components/ui/field";
import { FormLabel } from "~/components/ui/form-label";
import { Text } from "~/components/ui/text";
import { useLogin } from "~/hooks/use-login";
import { useToast } from "~/hooks/use-toast";
import { UserSchema } from "~/schema/user";
import { getDefaultUserIconUrl } from "~/utils";

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
	const { data: user } = useAuthMe();
	const { mutateAsync: register, isPending, error } = useRegister();
	const { mutateAsync: login } = useLogin();
	const toast = useToast();
	const location = useLocation();

	const searchParams = new URLSearchParams(location.search);
	const redirectState = searchParams.get("state");

	// 認証済みであれば /servers にリダイレクト
	useEffect(() => {
		if (user) {
			navigate("/servers", { replace: true });
		}
	}, [navigate, user]);

	const {
		register: registerField,
		handleSubmit,
		formState: { errors },
	} = useForm<FormInputValues>({
		resolver: standardSchemaResolver(RegisterForm),
		mode: "onSubmit",
		defaultValues: {
			displayId: "",
			name: "",
			email: "",
			password: "",
			bio: "",
			iconUrl: getDefaultUserIconUrl(),
		},
	});

	const onSubmit = async (data: FormInputValues) => {
		try {
			await register({
				data: {
					displayId: data.displayId,
					name: data.name,
					email: data.email,
					password: data.password,
					bio: data.bio || "",
					iconUrl: getDefaultUserIconUrl(),
				},
			});

			toast.success("アカウントを作成しました");
			await login({ email: data.email, password: data.password });
			if (redirectState) {
				navigate(`/invite/${redirectState.replace("invite:", "")}`);
			} else {
				navigate("/servers");
			}
		} catch (error) {
			console.error("Registration or login error:", error);
			toast.error("登録に失敗しました", "入力内容を確認してください");
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
					width: "500px",
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
							marginBottom: "16px",
						})}
					>
						新規登録
					</h1>
					<div
						className={css({
							background: "bg.tertiary",
							border: "1px solid",
							borderColor: "border.default",
							borderRadius: "md",
							padding: "12px",
							marginBottom: "8px",
						})}
					>
						<Text
							className={css({
								fontSize: "xs",
								color: "text.disabled",
								textAlign: "center",
								lineHeight: "1.4",
							})}
						>
							<TriangleAlert
								size={16}
								className={css({
									display: "inline",
									verticalAlign: "middle",
									marginRight: "8px",
									color: "danger.default",
								})}
							/>
							このサイトは学習目的で作成されています。普段使用しているメールアドレスやパスワードは絶対に使用しないでください。
						</Text>
					</div>
					<Text
						className={css({
							fontSize: "xs",
							color: "text.disabled",
							textAlign: "center",
							lineHeight: "1.4",
						})}
					>
						※アイコンとメールアドレスは実在しなくても大丈夫です
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
							disabled={isPending}
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
							<Link
								to={redirectState ? `/login?state=${redirectState}` : "/login"}
								className={css({
									fontWeight: "medium",
									color: "accent.default",
									_hover: {
										color: "accent.emphasized",
									},
								})}
							>
								ログインはこちら
							</Link>
						</div>
					</form>
				</Card.Body>
			</Card.Root>
		</div>
	);
}
