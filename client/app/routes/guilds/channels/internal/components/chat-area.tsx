import { useEffect, useRef, useState } from "react";
import { useOutletContext, useParams } from "react-router";
import { css } from "styled-system/css";
import type { Message as TMessage } from "~/api/gen/guildTypeProto.schemas";
import { useCreate, useGetByChannelID } from "~/api/gen/message/message";
import { Message } from "~/components/features/message";
import { MessageInput } from "~/components/features/message-input";
import { NotFoundPage } from "~/components/features/not-found-page";
import { Heading } from "~/components/ui/heading";
import { Spinner } from "~/components/ui/spinner";
import { Text } from "~/components/ui/text";
import { WebSocketEvent } from "~/constants";
import { useWebSocketEvent } from "~/hooks/use-websocket-event";
import type { GuildsContext } from "../../layout";
import { useWebSocket } from "~/contexts/websocket";
import { useGetCurrentUser } from "~/api/gen/user/user";
import { useMessages } from "../hooks/use-messages";
import { Loading } from "./loading";

export const ChatArea = () => {
	const { channelId } = useParams<{ channelId: string }>();
	const { guild } = useOutletContext<GuildsContext>();
	const { data: userData } = useGetCurrentUser();
	if (!channelId || !guild || !userData) {
		return <Loading />;
	}

	const { messages, messagesError, sendMessage } = useMessages(
		userData?.user.id,
		channelId
	);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const messagesContainerRef = useRef<HTMLDivElement>(null);

	const channelName = guild?.categories.map((category) => {
		return category.channels.find((channel) => channel?.id === channelId)?.name;
	});

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	if (messagesError) {
		return <NotFoundPage />;
	}

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

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
				ref={messagesContainerRef}
				className={css({
					flex: 1,
					overflowY: "auto",
					backgroundColor: "bg.primary",
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
							onReply={() => {}}
							onReact={() => {}}
						/>
					))}
					<div ref={messagesEndRef} />
				</div>
			</div>

			<MessageInput
				onSendMessage={sendMessage}
				placeholder="Message #general"
			/>
		</div>
	);
};
