import { useEffect, useRef, useState } from "react";
import { useOutletContext, useParams } from "react-router";
import { css } from "styled-system/css";
import { useCreate, useGetByChannelID } from "~/api/gen/message/message";
import type { WebSocketClient } from "~/api/websocket";
import { Message } from "~/components/features/message";
import { MessageInput } from "~/components/features/message-input";
import { NotFoundPage } from "~/components/features/not-found-page";
import { Heading } from "~/components/ui/heading";
import { Spinner } from "~/components/ui/spinner";
import { Text } from "~/components/ui/text";
import { SUBSCRIBE_CHANNELS } from "~/constants";
import { useWebSocketEvent } from "~/hooks/use-websocket-event";
import type { GuildsContext } from "../../layout";
import { useWebSocket } from "~/contexts/websocket";

export const ChatArea = () => {
	const { channelId } = useParams<{ channelId: string }>();
	if (!channelId) {
		return <div>Channel ID is missing</div>;
	}
	const { guild } = useOutletContext<GuildsContext>();
	const {
		data: messagesData,
		refetch,
		isLoading,
		error: messagesError,
	} = useGetByChannelID(channelId);
	const { mutateAsync: createMessage } = useCreate();
	const [messages, setMessages] = useState(() => messagesData?.messages || []);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const messagesContainerRef = useRef<HTMLDivElement>(null);
	const wsClient = useWebSocket();

	const channelName = guild?.categories.map((category) => {
		return category.channels.find((channel) => channel?.id === channelId)?.name;
	});

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		setMessages(messagesData?.messages || []);
	}, [messagesData]);

	const handleSendMessage = async (content: string) => {
		if (!channelId) return;
		try {
			await createMessage({ channelId, data: { content } });
			await refetch();
			scrollToBottom();
		} catch (error) {
			console.error("Failed to send message:", error);
		}
	};

	useWebSocketEvent(wsClient, SUBSCRIBE_CHANNELS, (event) => {
		setMessages((prev) => [...prev, event]);
	});

	if (isLoading) {
		return (
			<div
				className={css({
					flex: 1,
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					height: "100vh",
					backgroundColor: "bg.primary",
				})}
			>
				<Spinner size="lg" />
				<Text className={css({ mt: "4", color: "text.medium" })}>
					メッセージを読み込み中...
				</Text>
			</div>
		);
	}

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
				onSendMessage={handleSendMessage}
				placeholder="Message #general"
			/>
		</div>
	);
};
