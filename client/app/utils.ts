import { DEFAULT_USER_ICONS, DEFAULT_GUILD_ICONS } from "./constants";

export const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return date.toLocaleDateString("ja-JP", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
};

export const getDefaultUserIconUrl = () => {
  const icons = Object.values(DEFAULT_USER_ICONS);
  const randomIndex = Math.floor(Math.random() * icons.length);
  return icons[randomIndex];
}

export const getDefaultGuildIconUrl = () => {
  const icons = Object.values(DEFAULT_GUILD_ICONS);
  const randomIndex = Math.floor(Math.random() * icons.length);
  return icons[randomIndex];
}
