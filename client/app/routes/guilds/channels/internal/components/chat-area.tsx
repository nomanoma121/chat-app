import { css } from "styled-system/css";
import { useState, useRef, useEffect } from "react";
import { Message, type MessageData } from "~/components/features/message";
import { Input } from "~/components/ui/input";
import { Send, Plus, Smile } from "lucide-react";
import { IconButton } from "~/components/ui/icon-button";

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
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const newMessage: MessageData = {
      id: Date.now().toString(),
      content: inputValue,
      author: {
        id: "current-user",
        name: "You"
      },
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
        padding: "12px 16px",
        borderBottom: "1px solid",
        borderColor: "border.subtle",
        backgroundColor: "bg.primary",
        boxShadow: "0 1px 0 rgba(4,4,5,0.2), 0 1.5px 0 rgba(6,6,7,0.05), 0 2px 0 rgba(4,4,5,0.05)",
        zIndex: 1
      })}>
        <div className={css({
          display: "flex",
          alignItems: "center",
          gap: "8px"
        })}>
          <div className={css({
            color: "fg.muted",
            fontSize: "xl",
            fontWeight: "semibold"
          })}>
            #
          </div>
          <h2 className={css({
            fontSize: "lg",
            fontWeight: "semibold",
            color: "fg.default",
            margin: 0
          })}>
            general
          </h2>
        </div>
        <div className={css({
          marginLeft: "16px",
          color: "fg.subtle",
          fontSize: "sm"
        })}>
          Welcome to the general chat
        </div>
      </div>

      {/* Messages Area */}
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

      {/* Input Area */}
      <div className={css({
        padding: "16px 16px 24px 16px",
        backgroundColor: "bg.primary"
      })}>
        <div className={css({
          display: "flex",
          alignItems: "flex-end",
          gap: "12px",
          backgroundColor: "bg.emphasized",
          borderRadius: "lg",
          padding: "0 12px",
          minHeight: "44px"
        })}>
          <IconButton
            variant="ghost"
            size="sm"
            className={css({ 
              color: "fg.subtle",
              flexShrink: 0,
              alignSelf: "center"
            })}
          >
            <Plus size={20} />
          </IconButton>

          <div className={css({ 
            flex: 1,
            display: "flex",
            alignItems: "center",
            paddingY: "10px"
          })}>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Message #general"
              className={css({
                border: "none",
                backgroundColor: "transparent",
                padding: 0,
                fontSize: "md",
                color: "fg.default",
                width: "100%",
                _placeholder: {
                  color: "fg.subtle"
                },
                _focus: {
                  outline: "none",
                  boxShadow: "none"
                }
              })}
            />
          </div>

          <div className={css({
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexShrink: 0
          })}>
            <IconButton
              variant="ghost"
              size="sm"
              className={css({ 
                color: "fg.subtle",
                _hover: {
                  color: "fg.default"
                }
              })}
            >
              <Smile size={20} />
            </IconButton>
            
            <IconButton
              variant="ghost"
              size="sm"
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className={css({ 
                color: inputValue.trim() ? "accent.default" : "fg.subtle",
                _hover: {
                  color: inputValue.trim() ? "accent.emphasized" : "fg.default"
                },
                _disabled: {
                  opacity: 0.6,
                  cursor: "not-allowed",
                  _hover: {
                    color: "fg.subtle"
                  }
                }
              })}
            >
              <Send size={18} />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  )
}
