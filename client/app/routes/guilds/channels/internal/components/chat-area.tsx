import { useEffect } from "react";
import { useOutletContext, useParams } from "react-router";
import { css } from "styled-system/css";
import { useGetCurrentUser } from "~/api/gen/user/user";
import { Message } from "~/components/features/message";
import { MessageInput } from "~/components/features/message-input";
import { NotFoundPage } from "~/components/features/not-found-page";
import { Heading } from "~/components/ui/heading";
import type { GuildsContext } from "../../layout";
import { useAutoScroll } from "../hooks/use-auto-scroll";
import { useMessages } from "../hooks/use-messages";
import { Loading } from "./loading";

export const ChatArea = () => {
	const { channelId } = useParams<{ channelId: string }>();
	const { guild } = useOutletContext<GuildsContext>();
	const { data: userData } = useGetCurrentUser();
	const { messages, messagesError, sendMessage, firstMessageReceived } =
		useMessages(userData?.user.id || "", channelId || "");
	const { scrollRef, containerRef, scrollToBottom } = useAutoScroll();

	useEffect(() => {
		const behavior = firstMessageReceived ? "smooth" : "instant";
		scrollToBottom(behavior);
	}, [scrollToBottom, firstMessageReceived]);

	if (!channelId || !guild || !userData) {
		return <Loading />;
	}

	const channelName = guild?.categories.map((category) => {
		return category.channels.find((channel) => channel?.id === channelId)?.name;
	});

	if (messagesError) {
		return <NotFoundPage />;
	}

	return (
		<div
			className={css({
				flex: 1,
				display: "flex",
				flexDirection: "column",
				height: "100vh",
				backgroundColor: "bg.primary",
			})}
		>
			<div
				className={css({
					display: "flex",
					alignItems: "center",
					paddingX: "4",
					borderBottomWidth: "1px",
					borderColor: "border.soft",
					backgroundColor: "bg.primary",
					boxShadow:
						"0 1px 0 rgba(4,4,5,0.2), 0 1.5px 0 rgba(6,6,7,0.05), 0 2px 0 rgba(4,4,5,0.05)",
					zIndex: 1,
				})}
			>
				<div
					className={css({
						display: "flex",
						alignItems: "center",
						gap: "8px",
						height: "12",
					})}
				>
					<div
						className={css({
							color: "fg.muted",
							fontSize: "xl",
							fontWeight: "semibold",
						})}
					>
						#
					</div>
					<Heading
						className={css({
							fontSize: "lg",
							fontWeight: "semibold",
							color: "text.medium",
							margin: 0,
						})}
					>
						{channelName}
					</Heading>
				</div>
			</div>

			<div
				ref={containerRef}
				className={css({
					flex: 1,
					overflowY: "auto",
					backgroundColor: "bg.primary",
					"&::-webkit-scrollbar": {
						width: "8px",
					},
					"&::-webkit-scrollbar-track": {
						background: "transparent",
					},
					"&::-webkit-scrollbar-thumb": {
						background: "bg.tertiary",
						borderRadius: "4px",
						"&:hover": {
							background: "bg.quaternary",
						},
					},
					// For Firefox
					scrollbarWidth: "thin",
					scrollbarColor: "token(colors.bg.tertiary) transparent",
				})}
			>
				<div
					className={css({
						paddingTop: "16px",
						minHeight: "100%",
						display: "flex",
						flexDirection: "column",
						justifyContent: "flex-end",
					})}
				>
					{messages.map((message) => (
						<Message
							key={message.id}
							message={message}
						/>
					))}
					<div ref={scrollRef} />
				</div>
			</div>

			<MessageInput
				onSendMessage={sendMessage}
				placeholder="Message #general"
			/>
		</div>
	);
};
