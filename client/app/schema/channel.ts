import * as v from "valibot";

const MAX_CHANNEL_NAME_LENGTH = 20;
const MIN_CHANNEL_NAME_LENGTH = 2;

export const ChannelSchema = v.object({
	name: v.pipe(
		v.string(),
		v.minLength(MIN_CHANNEL_NAME_LENGTH),
		v.maxLength(MAX_CHANNEL_NAME_LENGTH),
	),
	description: v.optional(v.string()),
});
