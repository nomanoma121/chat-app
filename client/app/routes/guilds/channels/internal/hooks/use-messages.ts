import { useGetByChannelID } from "~/api/gen/message/message"
import { useEffect, useState } from "react"
import { useWebSocketEvent } from "~/hooks/use-websocket-event";
import type { Message } from "~/api/gen/guildTypeProto.schemas";
import { WebSocketEvent } from "~/constants";
import { useCreate } from "~/api/gen/message/message";
import { useWebSocket } from "~/contexts/websocket";
import { useToast } from "~/hooks/use-toast";


export const useMessages = (userId: string, channelId: string) => {
	const {
		data: messagesData,
		isLoading,
		error: messagesError,
	} = useGetByChannelID(channelId);
  const { mutateAsync: createMessage } = useCreate();
  const [messages, setMessages] = useState(() => messagesData?.messages || []);
  const wsClient = useWebSocket();
  const toast = useToast();

  const sendMessage = async (content: string) => {
    if (!channelId) return;
    try {
      await createMessage({ channelId, data: { content } });
    } catch (error) {
      toast.error("メッセージの送信に失敗しました。");
    }
  };

  useWebSocketEvent<Message>(WebSocketEvent.MessageCreate, (event) => {
    setMessages((prev) => [...prev, event]);
  });

  useEffect(() => {
    setMessages(messagesData?.messages || []);
  }, [messagesData]);

  useEffect(() => {
    if (!userId) return;

    wsClient.Send(WebSocketEvent.SubscribeChannels, {
      user_id: userId,
      channel_ids: [channelId],
    });
  }, [wsClient, userId, channelId]);

  return { messages, isLoading, messagesError, sendMessage };
}
