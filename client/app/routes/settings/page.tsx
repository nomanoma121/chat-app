import { ArrowLeft, Bell, Shield, User } from "lucide-react";
import { useNavigate } from "react-router";
import { css } from "styled-system/css";
import { Tabs } from "~/components/features/tabs";
import { Button } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";
import { NotificationTab } from "./internal/components/notification-tab";
import { PrivacyTab } from "./internal/components/privacy-tab";
import { ProfileTab } from "./internal/components/profile-tab";

export default function UserSetting() {
	const navigate = useNavigate();

	return (
		<div
			className={css({
				height: "100vh",
				width: "800",
				margin: "0 auto",
				background: "bg.primary",
				paddingY: "10",
			})}
		>
			<Button
				variant="ghost"
				size="sm"
				onClick={() => navigate(-1)}
				className={css({
					color: "text.medium",
					_hover: {
						color: "text.bright",
						background: "accent.default",
					},
				})}
			>
				<ArrowLeft size={18} />
				<Text className={css({ ml: "8px" })}>戻る</Text>
			</Button>
			<Heading
				className={css({ color: "text.bright", mt: "12px", mb: "20px" })}
				size="xl"
			>
				ユーザー設定
			</Heading>
			<Tabs.Root defaultValue="profile" variant="enclosed">
				<Tabs.List
					className={css({
						bgColor: "bg.tertiary",
						border: "none",
					})}
				>
					<Tabs.Trigger value="profile">
						<User size={16} className={css({ mr: "8px" })} />
						プロフィール
					</Tabs.Trigger>
					<Tabs.Trigger value="notifications">
						<Bell size={16} className={css({ mr: "8px" })} />
						通知
					</Tabs.Trigger>
					<Tabs.Trigger value="privacy">
						<Shield size={16} className={css({ mr: "8px" })} />
						プライバシー
					</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="profile">
					<ProfileTab />
				</Tabs.Content>
				<Tabs.Content value="notifications">
					<NotificationTab />
				</Tabs.Content>
				<Tabs.Content value="privacy">
					<PrivacyTab />
				</Tabs.Content>
			</Tabs.Root>
		</div>
	);
}
