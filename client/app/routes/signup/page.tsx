import { useId, useState } from "react";
import { useNavigate } from "react-router";
import { css } from "styled-system/css";
import { useRegister } from "~/api/gen/auth/auth";
import type { RegisterRequest } from "~/api/gen/userProto.schemas";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Field } from "~/components/ui/field";
import { FormLabel } from "~/components/ui/form-label";

export default function RegisterPage() {
	const displayIdId = useId();
	const nameId = useId();
	const emailId = useId();
	const passwordId = useId();
	const bioId = useId();
	const iconUrlId = useId();
	const navigate = useNavigate();

	const [formData, setFormData] = useState<RegisterRequest>({
		displayId: "",
		email: "",
		password: "",
		name: "",
		bio: "",
		iconUrl: "",
	});
	const { mutateAsync, isPending, error } = useRegister();

	const handleSubmit = async (e: React.FormEvent) => {
		try {
			e.preventDefault();
			await mutateAsync({ data: formData });
			navigate("/servers");
		} catch (_error) {
			// エラーはerror stateで表示される
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
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
						onSubmit={handleSubmit}
						className={css({
							display: "flex",
							flexDirection: "column",
							gap: "20px",
						})}
					>
						<Field.Root>
							<FormLabel color="text.bright">displayId</FormLabel>
							<Field.Input
								id={displayIdId}
								name="displayId"
								type="text"
								required
								placeholder="例: user123"
								value={formData.displayId}
								onChange={handleChange}
								className={css({
									background: "bg.primary",
									border: "none",
									color: "text.bright",
								})}
							/>
						</Field.Root>

						<Field.Root>
							<FormLabel color="text.bright">ニックネーム</FormLabel>
							<Field.Input
								id={nameId}
								name="name"
								type="text"
								required
								placeholder="例: 太郎"
								value={formData.name}
								onChange={handleChange}
								className={css({
									background: "bg.primary",
									border: "none",
									color: "text.bright",
								})}
							/>
						</Field.Root>

						<Field.Root>
							<FormLabel color="text.bright">メールアドレス</FormLabel>
							<Field.Input
								id={emailId}
								name="email"
								type="email"
								autoComplete="email"
								required
								placeholder="例: user@example.com"
								value={formData.email}
								onChange={handleChange}
								className={css({
									background: "bg.primary",
									border: "none",
									color: "text.bright",
								})}
							/>
						</Field.Root>

						<Field.Root>
							<FormLabel color="text.bright">パスワード</FormLabel>
							<Field.Input
								id={passwordId}
								name="password"
								type="password"
								autoComplete="new-password"
								required
								placeholder="パスワードを入力してください"
								value={formData.password}
								onChange={handleChange}
								className={css({
									background: "bg.primary",
									border: "none",
									color: "text.bright",
								})}
							/>
						</Field.Root>

						<Field.Root>
							<FormLabel color="text.bright">自己紹介（任意）</FormLabel>
							<Field.Textarea
								id={bioId}
								name="bio"
								rows={3}
								placeholder="自己紹介文を入力してください"
								value={formData.bio || ""}
								onChange={handleChange}
								className={css({
									background: "bg.primary",
									border: "none",
									color: "text.bright",
									resize: "none",
								})}
							/>
						</Field.Root>

						<Field.Root>
							<FormLabel color="text.bright">アイコンURL（任意）</FormLabel>
							<Field.Input
								id={iconUrlId}
								name="iconUrl"
								type="url"
								placeholder="https://example.com/icon.jpg"
								value={formData.iconUrl || ""}
								onChange={handleChange}
								className={css({
									background: "bg.primary",
									border: "none",
									color: "text.bright",
								})}
							/>
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
							className={css({
								width: "100%",
								marginTop: "10px",
							})}
						>
							{isPending ? "登録中..." : "新規登録"}
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
