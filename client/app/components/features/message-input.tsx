import { css } from "styled-system/css";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Send, Plus, Smile } from "lucide-react";
import { IconButton } from "~/components/ui/icon-button";

export interface MessageInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  className?: string;
}

export const MessageInput = ({ onSendMessage, placeholder = "Message #general", className }: MessageInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={[css({
      padding: "16px 16px 24px 16px",
      backgroundColor: "bg.primary"
    }), className].filter(Boolean).join(' ')}>
      <div className={css({
        display: "flex",
        alignItems: "flex-end",
        gap: "12px",
        backgroundColor: "bg.tertiary",
        borderRadius: "lg",
        padding: "0 12px",
        minHeight: "44px",
        border: "2px solid transparent",
        transition: "all 0.2s ease",
        _focusWithin: {
          borderColor: "accent.default",
          boxShadow: "0 0 0 2px rgba(229, 70, 102, 0.3)"
        }
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
            placeholder={placeholder}
            className={css({
              border: "none",
              backgroundColor: "transparent",
              padding: 0,
              fontSize: "md",
              color: "text.bright",
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
  );
};