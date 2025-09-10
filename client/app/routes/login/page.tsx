import { useState } from "react";
import { useLoginMutation } from "~/hooks/use-login";
import type { LoginRequest } from "~/api/gen/userProto.schemas";

export default function LoginPage() {
	const [formData, setFormData] = useState<LoginRequest>({
		email: "",
		password: "",
	});
	const { mutateAsync, isPending, error } = useLoginMutation();

	const handleSubmit = async (e: React.FormEvent) => {
		try {
			e.preventDefault();
			await mutateAsync(formData);
			alert("ログインに成功しました！");
		} catch (error) {
			alert("ログインに失敗しました。");
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData(prev => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						ログイン
					</h2>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="rounded-md shadow-sm -space-y-px">
						<div>
							<label htmlFor="email" className="sr-only">
								メールアドレス
							</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								className="relative block w-full px-3 py-2 border border-gray-300 rounded-t-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder="メールアドレス"
								value={formData.email}
								onChange={handleChange}
							/>
						</div>
						<div>
							<label htmlFor="password" className="sr-only">
								パスワード
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								required
								className="relative block w-full px-3 py-2 border border-gray-300 rounded-b-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder="パスワード"
								value={formData.password}
								onChange={handleChange}
							/>
						</div>
					</div>

					{error && (
						<div className="text-red-600 text-sm text-center">
							ログインに失敗しました。メールアドレスまたはパスワードを確認してください。
						</div>
					)}

					<div>
						<button
							type="submit"
							disabled={isPending}
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
						>
							{isPending ? "ログイン中..." : "ログイン"}
						</button>
					</div>

					<div className="text-center">
						<a
							href="/signup"
							className="font-medium text-indigo-600 hover:text-indigo-500"
						>
							アカウントをお持ちでない場合は新規登録
						</a>
					</div>
				</form>
			</div>
		</div>
	);
}
