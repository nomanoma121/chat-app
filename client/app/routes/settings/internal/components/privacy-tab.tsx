import { css } from "styled-system/css";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { Shield, Eye, Lock, AlertTriangle, Check } from "lucide-react";
import { useState } from "react";

export const PrivacyTab = () => {
  const [settings, setSettings] = useState({
    onlineStatus: true,
    allowDMs: false,
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
        gap: "24px",
      })}
    >
      {/* プライバシー設定 */}
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
            <Shield size={20} className={css({ marginRight: "8px" })} />
            プライバシー設定
          </h3>
          <Text
            className={css({
              fontSize: "sm",
              color: "text.medium",
              marginBottom: "16px",
            })}
          >
            アカウントのプライバシーを管理できます
          </Text>
        </Card.Header>

        <Card.Body
          className={css({
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          })}
        >
          {/* オンライン状態表示 */}
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
              <Eye size={20} className={css({ color: "accent.default" })} />
              <div>
                <Text
                  className={css({
                    fontWeight: "medium",
                    color: "text.bright",
                    marginBottom: "2px",
                  })}
                >
                  オンライン状態を表示
                </Text>
                <Text
                  className={css({
                    fontSize: "sm",
                    color: "text.medium",
                  })}
                >
                  他のユーザーにオンライン状態を表示する
                </Text>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('onlineStatus')}
              className={css({
                width: "20px",
                height: "20px",
                border: "2px solid",
                borderColor: settings.onlineStatus ? "accent.default" : "border.default",
                borderRadius: "sm",
                background: settings.onlineStatus ? "accent.default" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              })}
            >
              {settings.onlineStatus && <Check size={12} className={css({ color: "text.bright" })} />}
            </button>
          </div>

          {/* DM許可設定 */}
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
              <Lock size={20} className={css({ color: "accent.default" })} />
              <div>
                <Text
                  className={css({
                    fontWeight: "medium",
                    color: "text.bright",
                    marginBottom: "2px",
                  })}
                >
                  友達以外からのDMを許可
                </Text>
                <Text
                  className={css({
                    fontSize: "sm",
                    color: "text.medium",
                  })}
                >
                  知らないユーザーからのダイレクトメッセージを受け取る
                </Text>
              </div>
            </div>
            <button
              onClick={() => toggleSetting('allowDMs')}
              className={css({
                width: "20px",
                height: "20px",
                border: "2px solid",
                borderColor: settings.allowDMs ? "accent.default" : "border.default",
                borderRadius: "sm",
                background: settings.allowDMs ? "accent.default" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              })}
            >
              {settings.allowDMs && <Check size={12} className={css({ color: "text.bright" })} />}
            </button>
          </div>

          <Button className={css({ marginTop: "8px" })}>
            変更を保存
          </Button>
        </Card.Body>
      </Card.Root>

      {/* 危険な操作 */}
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
              color: "danger.default",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
            })}
          >
            <AlertTriangle size={20} className={css({ marginRight: "8px" })} />
            危険な操作
          </h3>
          <Text
            className={css({
              fontSize: "sm",
              color: "text.medium",
              marginBottom: "16px",
            })}
          >
            これらの操作は元に戻せません
          </Text>
        </Card.Header>

        <Card.Body>
          <Button
            variant="outline"
            className={css({
              color: "text.bright",
              bgColor: "danger.default",
              _hover: {
                bgColor: "danger.emphasized",
                color: "text.bright",
              },
            })}
          >
            アカウントを削除
          </Button>
        </Card.Body>
      </Card.Root>
    </div>
  );
};