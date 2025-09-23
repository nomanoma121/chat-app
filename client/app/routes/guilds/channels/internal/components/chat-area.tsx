import { useEffect, useRef } from "react";
import { css } from "styled-system/css";
import { Message } from "~/components/features/message";
import { MessageInput } from "~/components/features/message-input";
import { Heading } from "~/components/ui/heading";
import {
  useCreateMessage,
  useGetMessagesByChannelID,
} from "~/api/gen/message/message";
import { useParams } from "react-router";

export const ChatArea = () => {
	const { channelId } = useParams<{ channelId: string }>();
	if (!channelId) {
		return <div>Channel ID is missing</div>;
	}
  const { data: messagesData, refetch } = useGetMessagesByChannelID(channelId);
	const { mutateAsync: createMessage } = useCreateMessage();
  const messages = messagesData?.messages || [];
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleReply = (messageId: string) => {
    console.log("Reply to message:", messageId);
  };

  const handleReact = (messageId: string, emoji: string) => {
    console.log("React to message:", messageId, "with:", emoji);
  };

	const handleSendMessage = async (content: string) => {
		if (!channelId) return;
		try {
			await createMessage({ channelId, data: { content } });
			await refetch();
			scrollToBottom();
		} catch (error) {
			console.error("Failed to send message:", error);
		}
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
      {/* Channel Header */}
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
              color: "text.bright",
              margin: 0,
            })}
          >
            general
          </Heading>
        </div>
        <div
          className={css({
            marginLeft: "16px",
            color: "fg.subtle",
            fontSize: "sm",
          })}
        >
          Welcome to the general chat
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
              onReply={handleReply}
              onReact={handleReact}
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
