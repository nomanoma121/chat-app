/**
 * 1分単位のキャッシュバスト用タイムスタンプを生成
 * 同じ1分間は同じ値を返すため、適度にキャッシュが効く
 */
export const getCacheBustTimestamp = () => Math.floor(Date.now() / 60000);

/**
 * 画像URLにキャッシュバストパラメータを追加
 */
export const addCacheBust = (url?: string) => {
	if (!url) return undefined;
	const separator = url.includes("?") ? "&" : "?";
	return `${url}${separator}t=${getCacheBustTimestamp()}`;
};
