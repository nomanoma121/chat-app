import { css } from "styled-system/css";
import { useState, useRef, useEffect } from "react";
import { Message, type MessageData } from "~/components/features/message";
import { MessageInput } from "~/components/features/message-input";
import { Heading } from "~/components/ui/heading";

const mockMessages: MessageData[] = [
  {
    id: "1",
    content: "Welcome to this channel! 👋",
    author: {
      id: "user1",
      name: "Admin"
    },
    timestamp: new Date().toISOString()
  },
  {
    id: "2", 
    content: "This is a sample message to show how the chat area looks with multiple messages.",
    author: {
      id: "user2",
      name: "TestUser"
    },
    timestamp: new Date(Date.now() - 300000).toISOString()
  },
  {
    id: "3",
    content: "You can reply to messages and use reactions! The interface is designed to be similar to Discord.",
    author: {
      id: "user3", 
      name: "Developer"
    },
    timestamp: new Date(Date.now() - 600000).toISOString(),
    replyTo: {
      id: "2",
      author: { name: "TestUser" },
      content: "This is a sample message..."
    }
  }
];

export const ChatArea = () => {
  const [messages, setMessages] = useState<MessageData[]>(mockMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (message: string) => {
    const newMessage: MessageData = {
      id: Date.now().toString(),
      content: message,
      author: {
        id: "current-user",
        name: "You"
      },
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const handleReply = (messageId: string) => {
    console.log("Reply to message:", messageId);
  };

  const handleReact = (messageId: string, emoji: string) => {
    console.log("React to message:", messageId, "with:", emoji);
  };

  return (
    <div className={css({ 
      flex: 1, 
      display: "flex", 
      flexDirection: "column",
      height: "100vh",
      backgroundColor: "bg.primary"
    })}>
      {/* Channel Header */}
      <div className={css({
        display: "flex",
        alignItems: "center",
        paddingX: "4",
        borderBottomWidth: "1px",
        borderColor: "border.soft",
        backgroundColor: "bg.primary",
        boxShadow: "0 1px 0 rgba(4,4,5,0.2), 0 1.5px 0 rgba(6,6,7,0.05), 0 2px 0 rgba(4,4,5,0.05)",
        zIndex: 1
      })}>
        <div className={css({
          display: "flex",
          alignItems: "center",
          gap: "8px",
          height: "12",
        })}>
          <div className={css({
            color: "fg.muted",
            fontSize: "xl",
            fontWeight: "semibold"
          })}>
            #
          </div>
          <Heading className={css({
            fontSize: "lg",
            fontWeight: "semibold",
            color: "text.bright",
            margin: 0
          })}>
            general
          </Heading>
        </div>
        <div className={css({
          marginLeft: "16px",
          color: "fg.subtle",
          fontSize: "sm"
        })}>
          Welcome to the general chat
        </div>
      </div>

      <div 
        ref={messagesContainerRef}
        className={css({
          flex: 1,
          overflowY: "auto",
          backgroundColor: "bg.primary"
        })}
      >
        <div className={css({ 
          paddingTop: "16px",
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end"
        })}>
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
  )
}
