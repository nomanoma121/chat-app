import { useId, useState } from "react";
import type { LoginRequest } from "~/api/gen/userProto.schemas";
import { useLoginMutation } from "~/hooks/use-login";
import { Card } from "~/components/ui/card";
import { Field } from "~/components/ui/field";
import { FormLabel } from "~/components/ui/form-label";
import { css } from "styled-system/css";
import { Button } from "~/components/ui/button";
import { useNavigate } from "react-router";

export default function LoginPage() {
	const emailId = useId();
	const passwordId = useId();
	const navigate = useNavigate();
	const [formData, setFormData] = useState<LoginRequest>({
		email: "",
		password: "",
	});
	const { mutateAsync, isPending, error } = useLoginMutation();

	const handleSubmit = async (e: React.FormEvent) => {
		try {
			e.preventDefault();
			await mutateAsync(formData);
			navigate("/servers");
		} catch (_error) {
			// エラーはerror stateで表示される
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
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
							color: "text.bright"
						})}
					>
						ログイン
					</h1>
				</Card.Header>
				<Card.Body>
					<form onSubmit={handleSubmit} className={css({
						display: "flex",
						flexDirection: "column",
						gap: "20px",
					})}>
						<Field.Root>
							<FormLabel color="text.bright">メールアドレス</FormLabel>
							<Field.Input
								id={emailId}
								name="email"
								type="email"
								autoComplete="email"
								required
								placeholder="メールアドレスを入力してください"
								value={formData.email}
								onChange={handleChange}
								className={css({ 
									background: "bg.primary", 
									border: "none",
									color: "text.bright"
								})}
							/>
						</Field.Root>
						<Field.Root>
							<FormLabel color="text.bright">パスワード</FormLabel>
							<Field.Input
								id={passwordId}
								name="password"
								type="password"
								autoComplete="current-password"
								required
								placeholder="パスワードを入力してください"
								value={formData.password}
								onChange={handleChange}
								className={css({ 
									background: "bg.primary", 
									border: "none",
									color: "text.bright"
								})}
							/>
						</Field.Root>

						{error && (
							<div className={css({
								color: "accent.default",
								fontSize: "sm",
								textAlign: "center",
								padding: "2",
								bg: "bg.tertiary",
								borderRadius: "md"
							})}>
								ログインに失敗しました。メールアドレスまたはパスワードを確認してください。
							</div>
						)}

						<Button 
							type="submit"
							disabled={isPending}
							className={css({ 
								width: "100%",
								marginTop: "10px"
							})}
						>
							{isPending ? "ログイン中..." : "ログイン"}
						</Button>

						<div className={css({
							textAlign: "center",
							marginTop: "4"
						})}>
							<a
								href="/signup"
								className={css({
									fontWeight: "medium",
									color: "accent.default",
									_hover: {
										color: "accent.emphasized"
									}
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