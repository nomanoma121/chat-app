import { css } from "styled-system/css";
import { Card } from "~/components/ui/card";
import { Field } from "~/components/ui/field";
import { FormLabel } from "~/components/ui/form-label";
import { Button } from "~/components/ui/button";
import { Avatar } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Upload, ArrowLeft, Shield, Bell, Palette, Globe } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";

const mockUserData = {
  id: "user-1",
  displayId: "user123",
  name: "太郎",
  email: "taro@example.com",
  bio: "フルスタック開発者です。React、Node.js、Goが得意です。",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
  status: "オンライン",
  joinedAt: "2024/1/10",
  verified: true
};

export default function GeneralSetting() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    displayId: mockUserData.displayId,
    name: mockUserData.name,
    email: mockUserData.email,
    bio: mockUserData.bio || ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = () => {
    console.log("Saving user settings:", formData);
    // 実際のAPI呼び出し処理
  };

  return (
    <div className={css({
      minHeight: "100vh",
      background: "bg.primary"
    })}>
      {/* ヘッダー */}
      <div className={css({
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 24px",
        borderBottom: "1px solid",
        borderColor: "border.subtle",
        background: "bg.secondary"
      })}>
        <div className={css({
          display: "flex",
          alignItems: "center",
          gap: "16px"
        })}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className={css({
              color: "text.medium",
              _hover: {
                color: "text.bright"
              }
            })}
          >
            <ArrowLeft size={18} />
            戻る
          </Button>
        </div>
        <h1 className={css({
          fontSize: "xl",
          fontWeight: "semibold",
          color: "text.bright"
        })}>
          ユーザー設定
        </h1>
        <div /> {/* スペーサー */}
      </div>

      <div className={css({
        maxWidth: "800px",
        margin: "0 auto",
        padding: "40px 20px"
      })}>
        {/* プロフィール情報 */}
        <Card.Root className={css({
          background: "bg.secondary",
          marginBottom: "32px"
        })}>
          <Card.Header className={css({ padding: "24px" })}>
            <h2 className={css({
              fontSize: "lg",
              fontWeight: "semibold",
              color: "text.bright",
              marginBottom: "8px"
            })}>
              プロフィール情報
            </h2>
            <p className={css({
              fontSize: "sm",
              color: "text.medium"
            })}>
              あなたの基本的なプロフィール情報を管理できます
            </p>
          </Card.Header>

          <Card.Body className={css({ padding: "0 24px 24px" })}>
            {/* アバター */}
            <div className={css({
              display: "flex",
              alignItems: "center",
              gap: "20px",
              marginBottom: "24px"
            })}>
              <div className={css({ position: "relative" })}>
                <Avatar
                  name={mockUserData.name}
                  src={mockUserData.avatar}
                  size="xl"
                  className={css({
                    width: "80px",
                    height: "80px"
                  })}
                />
                {mockUserData.verified && (
                  <Badge
                    className={css({
                      position: "absolute",
                      bottom: "-4px",
                      right: "-4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "xs",
                      backgroundColor: "#10b981",
                      color: "bg.primary"
                    })}
                  >
                    <Shield size={10} />
                    認証済み
                  </Badge>
                )}
              </div>
              <div className={css({ flex: 1 })}>
                <h3 className={css({
                  fontSize: "lg",
                  fontWeight: "semibold",
                  color: "text.bright",
                  marginBottom: "4px"
                })}>
                  {mockUserData.name}
                </h3>
                <p className={css({
                  fontSize: "sm",
                  color: "text.medium",
                  marginBottom: "12px"
                })}>
                  参加日: {mockUserData.joinedAt}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className={css({
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  })}
                >
                  <Upload size={14} />
                  アバターを変更
                </Button>
              </div>
            </div>

            <div className={css({
              display: "flex",
              flexDirection: "column",
              gap: "20px"
            })}>
              {/* Display ID */}
              <Field.Root>
                <FormLabel color="text.bright">表示ID</FormLabel>
                <Field.Input
                  name="displayId"
                  value={formData.displayId}
                  onChange={handleChange}
                  className={css({
                    background: "bg.primary",
                    border: "none",
                    color: "text.bright"
                  })}
                />
              </Field.Root>

              {/* 名前 */}
              <Field.Root>
                <FormLabel color="text.bright">表示名</FormLabel>
                <Field.Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={css({
                    background: "bg.primary",
                    border: "none",
                    color: "text.bright"
                  })}
                />
              </Field.Root>

              {/* メール */}
              <Field.Root>
                <FormLabel color="text.bright">メールアドレス</FormLabel>
                <Field.Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={css({
                    background: "bg.primary",
                    border: "none",
                    color: "text.bright"
                  })}
                />
              </Field.Root>

              {/* 自己紹介 */}
              <Field.Root>
                <FormLabel color="text.bright">自己紹介</FormLabel>
                <Field.Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  placeholder="あなたについて教えてください..."
                  className={css({
                    background: "bg.primary",
                    border: "none",
                    color: "text.bright",
                    resize: "none"
                  })}
                />
              </Field.Root>
            </div>

            <div className={css({
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "24px"
            })}>
              <Button onClick={handleSave}>
                変更を保存
              </Button>
            </div>
          </Card.Body>
        </Card.Root>

        {/* その他の設定 */}
        <div className={css({
          display: "grid",
          gridTemplateColumns: { base: "1fr", md: "repeat(2, 1fr)" },
          gap: "24px"
        })}>
          {/* 通知設定 */}
          <Card.Root className={css({
            background: "bg.secondary",
            cursor: "pointer",
            _hover: {
              borderColor: "accent.default"
            }
          })}>
            <Card.Body className={css({
              padding: "24px",
              display: "flex",
              alignItems: "center",
              gap: "16px"
            })}>
              <div className={css({
                padding: "12px",
                background: "bg.tertiary",
                borderRadius: "lg"
              })}>
                <Bell size={24} className={css({ color: "accent.default" })} />
              </div>
              <div>
                <h3 className={css({
                  fontSize: "md",
                  fontWeight: "semibold",
                  color: "text.bright",
                  marginBottom: "4px"
                })}>
                  通知設定
                </h3>
                <p className={css({
                  fontSize: "sm",
                  color: "text.medium"
                })}>
                  メッセージや招待の通知を管理
                </p>
              </div>
            </Card.Body>
          </Card.Root>

          {/* テーマ設定 */}
          <Card.Root className={css({
            background: "bg.secondary",
            cursor: "pointer",
            _hover: {
              borderColor: "accent.default"
            }
          })}>
            <Card.Body className={css({
              padding: "24px",
              display: "flex",
              alignItems: "center",
              gap: "16px"
            })}>
              <div className={css({
                padding: "12px",
                background: "bg.tertiary",
                borderRadius: "lg"
              })}>
                <Palette size={24} className={css({ color: "accent.default" })} />
              </div>
              <div>
                <h3 className={css({
                  fontSize: "md",
                  fontWeight: "semibold",
                  color: "text.bright",
                  marginBottom: "4px"
                })}>
                  外観設定
                </h3>
                <p className={css({
                  fontSize: "sm",
                  color: "text.medium"
                })}>
                  テーマや表示オプションを設定
                </p>
              </div>
            </Card.Body>
          </Card.Root>

          {/* 言語設定 */}
          <Card.Root className={css({
            background: "bg.secondary",
            cursor: "pointer",
            _hover: {
              borderColor: "accent.default"
            }
          })}>
            <Card.Body className={css({
              padding: "24px",
              display: "flex",
              alignItems: "center",
              gap: "16px"
            })}>
              <div className={css({
                padding: "12px",
                background: "bg.tertiary",
                borderRadius: "lg"
              })}>
                <Globe size={24} className={css({ color: "accent.default" })} />
              </div>
              <div>
                <h3 className={css({
                  fontSize: "md",
                  fontWeight: "semibold",
                  color: "text.bright",
                  marginBottom: "4px"
                })}>
                  言語・地域
                </h3>
                <p className={css({
                  fontSize: "sm",
                  color: "text.medium"
                })}>
                  表示言語とタイムゾーンを設定
                </p>
              </div>
            </Card.Body>
          </Card.Root>

          {/* プライバシー設定 */}
          <Card.Root className={css({
            background: "bg.secondary",
            cursor: "pointer",
            _hover: {
              borderColor: "accent.default"
            }
          })}>
            <Card.Body className={css({
              padding: "24px",
              display: "flex",
              alignItems: "center",
              gap: "16px"
            })}>
              <div className={css({
                padding: "12px",
                background: "bg.tertiary",
                borderRadius: "lg"
              })}>
                <Shield size={24} className={css({ color: "accent.default" })} />
              </div>
              <div>
                <h3 className={css({
                  fontSize: "md",
                  fontWeight: "semibold",
                  color: "text.bright",
                  marginBottom: "4px"
                })}>
                  プライバシー・セキュリティ
                </h3>
                <p className={css({
                  fontSize: "sm",
                  color: "text.medium"
                })}>
                  アカウントのセキュリティを管理
                </p>
              </div>
            </Card.Body>
          </Card.Root>
        </div>
      </div>
    </div>
  );
}
