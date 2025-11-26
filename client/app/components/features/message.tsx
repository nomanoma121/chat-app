import { forwardRef } from "react";
import { css, cva } from "styled-system/css";
import type { Message as TMessage } from "~/api/gen/guildTypeProto.schemas";
import { Avatar } from "~/components/ui/avatar";
import { addCacheBust } from "~/utils";

const messageStyles = cva({
	base: {
		display: "flex",
		padding: "8px 16px",
		position: "relative",
		transition: "background 0.1s ease",
		_hover: {
			bg: "bg.quaternary",
		},
	},
});

const messageAvatarStyles = cva({
	base: {
		flexShrink: 0,
		marginRight: "16px",
		marginTop: "2px",
	},
});

const messageContentStyles = cva({
	base: {
		flex: 1,
		minWidth: 0,
	},
});

const messageHeaderStyles = cva({
	base: {
		display: "flex",
		alignItems: "baseline",
		marginBottom: "2px",
		gap: "8px",
	},
});

export interface MessageProps {
	message: TMessage;
	className?: string;
}

export const Message = forwardRef<HTMLDivElement, MessageProps>(
	(props, ref) => {
		const { message, className, ...rest } = props;

		const formatTimestamp = (timestamp: string) => {
			const date = new Date(timestamp);
			const now = new Date();
			const isToday = date.toDateString() === now.toDateString();

			if (isToday) {
				return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
			}

			return (
				date.toLocaleDateString([], {
					month: "short",
					day: "numeric",
				}) +
				` at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
			);
		};

		return (
			<div
				ref={ref}
				className={[messageStyles(), className].filter(Boolean).join(" ")}
				{...rest}
			>
				<div className={messageAvatarStyles()}>
					<Avatar
						name={message?.sender?.name ?? "Unknown"}
						src={addCacheBust(message?.sender?.iconUrl)}
						size="sm"
					/>
				</div>

				<div className={messageContentStyles()}>
					<div className={messageHeaderStyles()}>
						<span
							className={css({
								fontWeight: "semibold",
								fontSize: "sm",
								color: "text.bright",
								cursor: "pointer",
								_hover: { textDecoration: "underline" },
							})}
						>
							{message?.sender?.name}
						</span>
						<span
							className={css({
								fontSize: "xs",
								color: "fg.muted",
								fontWeight: "medium",
							})}
						>
							{formatTimestamp(message.createdAt)}
						</span>
					</div>

					<div
						className={css({
							fontSize: "md",
							lineHeight: "1.375",
							color: "text.medium",
							wordWrap: "break-word",
						})}
					>
						{message.content}
					</div>
				</div>
			</div>
		);
	},
);

Message.displayName = "Message";
