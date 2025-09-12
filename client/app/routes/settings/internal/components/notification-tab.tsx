import { css } from "styled-system/css";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Bell, MessageCircle, UserPlus, Volume2, Check } from "lucide-react";
import { useState } from "react";

export const NotificationTab = () => {
  const [settings, setSettings] = useState({
    messages: true,
    invites: true,
    sound: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
      })}
    >
      <Card.Root
        className={css({
          background: "bg.secondary",
        })}
      >
        <Card.Header>
          <h3
            className={css({
              fontSize: "lg",
              fontWeight: "semibold",
              color: "text.bright",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
            })}
          >
            <Bell size={20} className={css({ marginRight: "8px" })} />
            通知設定
          </h3>
          <Text
            className={css({
              fontSize: "sm",
              color: "text.medium",
              marginBottom: "16px",
            })}
          >
            メッセージや招待の通知を管理できます
          </Text>
        </Card.Header>

        <Card.Body
          className={css({
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          })}
        >
          {/* メッセージ通知 */}
          <div
            className={css({
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px",
              background: "bg.tertiary",
              borderRadius: "md",
            })}
          >
            <div className={css({ display: "flex", alignItems: "center", gap: "12px" })}>
              <MessageCircle size={20} className={css({ color: "accent.default" })} />
              <div>
                <Text
                  className={css({
                    fontWeight: "medium",
                    color: "text.bright",
                    marginBottom: "2px",
                  })}
                >
                  メッセージ通知
                </Text>
                <Text
                  className={css({
                    fontSize: "sm",
                    color: "text.medium",
                  })}
                >
                  新しいメッセージの通知を受け取る
                </Text>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('messages')}
              className={css({
                width: "20px",
                height: "20px",
                border: "2px solid",
                borderColor: settings.messages ? "accent.default" : "border.default",
                borderRadius: "sm",
                background: settings.messages ? "accent.default" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              })}
            >
              {settings.messages && <Check size={12} className={css({ color: "text.bright" })} />}
            </button>
          </div>

          {/* 招待通知 */}
          <div
            className={css({
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px",
              background: "bg.tertiary",
              borderRadius: "md",
            })}
          >
            <div className={css({ display: "flex", alignItems: "center", gap: "12px" })}>
              <UserPlus size={20} className={css({ color: "accent.default" })} />
              <div>
                <Text
                  className={css({
                    fontWeight: "medium",
                    color: "text.bright",
                    marginBottom: "2px",
                  })}
                >
                  招待通知
                </Text>
                <Text
                  className={css({
                    fontSize: "sm",
                    color: "text.medium",
                  })}
                >
                  サーバー招待の通知を受け取る
                </Text>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('invites')}
              className={css({
                width: "20px",
                height: "20px",
                border: "2px solid",
                borderColor: settings.invites ? "accent.default" : "border.default",
                borderRadius: "sm",
                background: settings.invites ? "accent.default" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              })}
            >
              {settings.invites && <Check size={12} className={css({ color: "text.bright" })} />}
            </button>
          </div>

          {/* サウンド通知 */}
          <div
            className={css({
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px",
              background: "bg.tertiary",
              borderRadius: "md",
            })}
          >
            <div className={css({ display: "flex", alignItems: "center", gap: "12px" })}>
              <Volume2 size={20} className={css({ color: "accent.default" })} />
              <div>
                <Text
                  className={css({
                    fontWeight: "medium",
                    color: "text.bright",
                    marginBottom: "2px",
                  })}
                >
                  サウンド通知
                </Text>
                <Text
                  className={css({
                    fontSize: "sm",
                    color: "text.medium",
                  })}
                >
                  通知音を有効にする
                </Text>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('sound')}
              className={css({
                width: "20px",
                height: "20px",
                border: "2px solid",
                borderColor: settings.sound ? "accent.default" : "border.default",
                borderRadius: "sm",
                background: settings.sound ? "accent.default" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              })}
            >
              {settings.sound && <Check size={12} className={css({ color: "text.bright" })} />}
            </button>
          </div>

          <Button className={css({ marginTop: "8px" })}>
            変更を保存
          </Button>
        </Card.Body>
      </Card.Root>
    </div>
  );
};