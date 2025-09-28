export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const CLIENT_BASE_URL = import.meta.env.VITE_CLIENT_BASE_URL || 'http://localhost:5173';

export const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return date.toLocaleDateString("ja-JP", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	});
};
