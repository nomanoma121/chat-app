import * as v from "valibot";

export const UserSchema = {
	Email: v.pipe(
		v.string(),
		v.minLength(1, "メールアドレスは必須です"),
		v.email("有効なメールアドレスを入力してください"),
	),
	Password: v.pipe(
		v.string(),
		v.minLength(8, "パスワードは8文字以上で入力してください"),
		v.maxLength(100, "パスワードは100文字以内で入力してください"),
	),
	DisplayId: v.pipe(
		v.string(),
		v.minLength(3, "ユーザーIDは3文字以上で入力してください"),
		v.maxLength(20, "ユーザーIDは20文字以内で入力してください"),
		v.regex(/^[a-zA-Z0-9_-]+$/, "ユーザーIDは英数字、アンダースコア、ハイフンのみ使用できます"),
	),
	Name: v.pipe(
		v.string(),
		v.minLength(1, "ニックネームは必須です"),
		v.maxLength(50, "ニックネームは50文字以内で入力してください"),
	),
	Bio: v.optional(
		v.pipe(v.string(), v.maxLength(500, "自己紹介は500文字以内で入力してください")),
	),
	IconUrl: v.optional(
		v.pipe(v.string(), v.url("有効なURLを入力してください")),
	),
};
