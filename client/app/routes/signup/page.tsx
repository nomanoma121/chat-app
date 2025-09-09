import { useState } from "react";
import { useRegister } from "~/api/gen/auth/auth";
import type { RegisterRequest } from "~/api/gen/userProto.schemas";

export default function RegisterPage() {
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
			alert("登録に成功しました！");
		} catch (error) {
			alert("登録に失敗しました。");
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
						新規登録
					</h2>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="space-y-4">
						<div>
							<label htmlFor="displayId" className="block text-sm font-medium text-gray-700">
								displayId: 
							</label>
							<input
								id="displayId"
								name="displayId"
								type="text"
								required
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								placeholder="例: user123"
								value={formData.displayId}
								onChange={handleChange}
							/>
						</div>

						<div>
							<label htmlFor="name" className="block text-sm font-medium text-gray-700">
							  ニックネーム
							</label>
							<input
								id="name"
								name="name"
								type="text"
								required
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								placeholder="例: 太郎"
								value={formData.name}
								onChange={handleChange}
							/>
						</div>

						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700">
								メールアドレス
							</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								placeholder="例: user@example.com"
								value={formData.email}
								onChange={handleChange}
							/>
						</div>

						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-700">
								パスワード
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="new-password"
								required
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								placeholder="パスワード"
								value={formData.password}
								onChange={handleChange}
							/>
						</div>

						<div>
							<label htmlFor="bio" className="block text-sm font-medium text-gray-700">
								自己紹介（任意）
							</label>
							<textarea
								id="bio"
								name="bio"
								rows={3}
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								placeholder="自己紹介文"
								value={formData.bio || ""}
								onChange={handleChange}
							/>
						</div>

						<div>
							<label htmlFor="iconUrl" className="block text-sm font-medium text-gray-700">
								アイコンURL（任意）
							</label>
							<input
								id="iconUrl"
								name="iconUrl"
								type="url"
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								placeholder="https://example.com/icon.jpg"
								value={formData.iconUrl || ""}
								onChange={handleChange}
							/>
						</div>
					</div>

					{error && (
						<div className="text-red-600 text-sm text-center">
							登録に失敗しました。入力内容を確認してください。
						</div>
					)}

					<div>
						<button
							type="submit"
							disabled={isPending}
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
						>
							{isPending ? "登録中..." : "新規登録"}
						</button>
					</div>

					<div className="text-center">
						<a
							href="/login"
							className="font-medium text-indigo-600 hover:text-indigo-500"
						>
							既にアカウントをお持ちの場合はログイン
						</a>
					</div>
				</form>
			</div>
		</div>
	);
}
