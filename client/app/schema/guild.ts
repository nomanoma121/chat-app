import * as v from "valibot";

const MAX_GUILD_NAME_LENGTH = 20;
const MIN_GUILD_NAME_LENGTH = 2;
const MAX_GUILD_DESCRIPTION_LENGTH = 100;

export const GuildSchema = {
	Name: v.pipe(
		v.string(),
		v.minLength(MIN_GUILD_NAME_LENGTH),
		v.maxLength(MAX_GUILD_NAME_LENGTH),
	),
	Description: v.optional(
		v.pipe(v.string(), v.maxLength(MAX_GUILD_DESCRIPTION_LENGTH)),
	),
	IconUrl: v.string(),
};
