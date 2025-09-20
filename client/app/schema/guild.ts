import * as v from "valibot";


export const GuildSchema = {
	Name: v.pipe(
		v.string(),
		v.minLength(1, "サーバー名は必須です"),
		v.maxLength(20, "サーバー名は20文字以内で入力してください"),
	),
	Description: v.optional(
		v.pipe(v.string(), v.maxLength(100, "説明は100文字以内で入力してください")),
	),
	IconUrl: v.pipe(
		v.string(),
		v.url("有効なURLを入力してください"),
	)
};
