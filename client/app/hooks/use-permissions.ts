import { useMemo } from "react";
import type { GuildDetail } from "~/api/gen/guildTypeProto.schemas";

// JWTトークンからユーザーIDを取得する関数
const getUserIdFromToken = (): string | null => {
	try {
		const token = localStorage.getItem("authToken");
		if (!token) return null;

		const payload = JSON.parse(atob(token.split('.')[1]));
		return payload.user_id || null;
	} catch (error) {
		console.error("Failed to parse JWT token:", error);
		return null;
	}
};

export const usePermissions = (guild?: GuildDetail) => {
	const currentUserId = useMemo(() => getUserIdFromToken(), []);

	const permissions = useMemo(() => {
		if (!guild || !currentUserId) {
			return {
				canManageGuild: false,
				canCreateChannels: false,
				canCreateCategories: false,
				canCreateInvites: false,
				canViewSettings: false,
				canEditGuild: false,
			};
		}

		// オーナーは全ての権限を持つ
		const isOwner = guild.ownerId === currentUserId;

		// 現在はオーナーのみが管理操作を実行可能
		// 将来的にはロールベースの権限システムを追加可能
		return {
			canManageGuild: isOwner,
			canCreateChannels: isOwner,
			canCreateCategories: isOwner,
			canCreateInvites: isOwner,
			canViewSettings: isOwner, // オーナーのみ設定画面にアクセス可能
			canEditGuild: isOwner,
		};
	}, [guild, currentUserId]);

	return {
		...permissions,
		isOwner: permissions.canManageGuild,
		currentUserId,
	};
};