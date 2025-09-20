import * as v from "valibot";

const MAX_CATEGORY_NAME_LENGTH = 20;
const MIN_CATEGORY_NAME_LENGTH = 2;

export const CategorySchema = v.object({
	name: v.pipe(
		v.string(),
		v.minLength(MIN_CATEGORY_NAME_LENGTH),
		v.maxLength(MAX_CATEGORY_NAME_LENGTH),
	),
});
