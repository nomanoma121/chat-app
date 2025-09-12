import { css } from "styled-system/css";
import { Card } from "~/components/ui/card";
import { Field } from "~/components/ui/field";
import { FormLabel } from "~/components/ui/form-label";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ArrowLeft, Link, Copy, Trash2, Calendar, Users, UserPlus } from "lucide-react";
import { useNavigate } from "react-router";
import { Text } from "~/components/ui/text";
import { Heading } from "~/components/ui/heading";
import { useState } from "react";

const mockInvites = [
  {
    id: "abc123",
    code: "abc123",
    uses: 5,
    maxUses: 10,
    creator: "yamada_taro",
    createdAt: "2025年9月11日 05:33",
    expiresAt: "2025年9月20日 05:33",
    temporary: false,
  },
  {
    id: "xyz789",
    code: "xyz789",
    uses: 12,
    maxUses: null,
    creator: "sato_hanako",
    createdAt: "2025年9月8日 05:33",
    expiresAt: null,
    temporary: false,
  },
];

export default function InvitePage() {
  const navigate = useNavigate();
  const [inviteSettings, setInviteSettings] = useState({
    maxUses: "10",
    expiryDays: "7",
    temporary: false,
  });

  const handleSettingChange = (key: string, value: string | boolean) => {
    setInviteSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCreateInvite = () => {
    console.log("Creating invite with settings:", inviteSettings);
    // 実際のAPI呼び出し処理
  };

  const handleCopyInvite = (code: string) => {
    navigator.clipboard.writeText(`https://discord.gg/${code}`);
    console.log(`Copied invite: ${code}`);
  };

  const handleDeleteInvite = (id: string) => {
    console.log(`Deleting invite: ${id}`);
    // 実際の削除処理
  };

  return (
    <div
      className={css({
        height: "100vh",
        width: "800",
        margin: "0 auto",
        background: "bg.primary",
        paddingY: "10",
      })}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className={css({
          color: "text.medium",
          _hover: {
            color: "text.bright",
            background: "accent.default",
          },
        })}
      >
        <ArrowLeft size={18} />
        <Text className={css({ ml: "8px" })}>戻る</Text>
      </Button>
      
      <div className={css({ mt: "12px", mb: "20px" })}>
        <Heading
          className={css({ 
            color: "text.bright", 
            display: "flex", 
            alignItems: "center",
            mb: "8px"
          })}
          size="xl"
        >
          <UserPlus size={24} className={css({ mr: "12px" })} />
          サーバー招待
        </Heading>
        <Text className={css({ color: "text.medium", fontSize: "sm" })}>
          招待リンクを作成・管理して、新しいメンバーをサーバーに招待しましょう
        </Text>
      </div>

      {/* 新しい招待リンク作成 */}
      <Card.Root
        className={css({
          background: "bg.secondary",
          mb: "24px",
        })}
      >
        <Card.Header>
          <Heading
            className={css({
              fontSize: "lg",
              fontWeight: "semibold",
              color: "text.bright",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
            })}
          >
            <Link size={20} className={css({ marginRight: "8px" })} />
            新しい招待リンクを作成
          </Heading>
          <Text
            className={css({
              fontSize: "sm",
              color: "text.medium",
              marginBottom: "16px",
            })}
          >
            招待リンクの設定を行い、新しい招待を作成します
          </Text>
        </Card.Header>

        <Card.Body
          className={css({
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          })}
        >
          <div className={css({ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" })}>
            <Field.Root>
              <FormLabel color="text.bright">最大使用回数</FormLabel>
              <Field.Select
                value={inviteSettings.maxUses}
                onValueChange={(value) => handleSettingChange('maxUses', value)}
              >
                <option value="1">1回</option>
                <option value="5">5回</option>
                <option value="10">10回</option>
                <option value="25">25回</option>
                <option value="50">50回</option>
                <option value="100">100回</option>
                <option value="unlimited">無制限</option>
              </Field.Select>
            </Field.Root>

            <Field.Root>
              <FormLabel color="text.bright">有効期限</FormLabel>
              <Field.Select
                value={inviteSettings.expiryDays}
                onValueChange={(value) => handleSettingChange('expiryDays', value)}
              >
                <option value="1">1日後</option>
                <option value="7">7日後</option>
                <option value="30">30日後</option>
                <option value="never">無期限</option>
              </Field.Select>
            </Field.Root>
          </div>

          <Button onClick={handleCreateInvite} className={css({ alignSelf: "flex-start" })}>
            招待リンクを作成
          </Button>
        </Card.Body>
      </Card.Root>

      {/* 既存の招待リンク */}
      <Card.Root
        className={css({
          background: "bg.secondary",
        })}
      >
        <Card.Header>
          <Heading
            className={css({
              fontSize: "lg",
              fontWeight: "semibold",
              color: "text.bright",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            })}
          >
            <span className={css({ display: "flex", alignItems: "center" })}>
              <Users size={20} className={css({ marginRight: "8px" })} />
              既存の招待リンク ({mockInvites.length})
            </span>
          </Heading>
        </Card.Header>

        <Card.Body className={css({ padding: "0" })}>
          {mockInvites.map((invite) => (
            <div
              key={invite.id}
              className={css({
                padding: "20px",
                borderBottom: "1px solid",
                borderColor: "border.soft",
                _last: { borderBottom: "none" },
                _hover: { background: "bg.tertiary" },
              })}
            >
              <div className={css({ display: "flex", justifyContent: "space-between", alignItems: "flex-start" })}>
                <div className={css({ flex: 1 })}>
                  <div className={css({ display: "flex", alignItems: "center", gap: "12px", mb: "8px" })}>
                    <Text
                      className={css({
                        fontFamily: "mono",
                        fontSize: "lg",
                        fontWeight: "semibold",
                        color: "text.bright",
                        background: "bg.quaternary",
                        padding: "4px 8px",
                        borderRadius: "sm",
                      })}
                    >
                      {invite.code}
                    </Text>
                    <Badge
                      className={css({
                        background: invite.uses >= (invite.maxUses || 999) ? "danger.default" : "accent.default",
                        color: "text.bright",
                      })}
                    >
                      {invite.uses}回使用
                    </Badge>
                  </div>

                  <div className={css({ display: "flex", flexDirection: "column", gap: "4px" })}>
                    <Text className={css({ fontSize: "sm", color: "text.medium" })}>
                      作成者: {invite.creator}
                    </Text>
                    <Text className={css({ fontSize: "sm", color: "text.medium" })}>
                      作成日: {invite.createdAt}
                    </Text>
                    {invite.expiresAt && (
                      <Text className={css({ fontSize: "sm", color: "text.medium" })}>
                        期限: {invite.expiresAt}
                      </Text>
                    )}
                    {invite.maxUses && (
                      <Text className={css({ fontSize: "sm", color: "text.medium" })}>
                        最大使用回数: {invite.maxUses}回
                      </Text>
                    )}
                  </div>
                </div>

                <div className={css({ display: "flex", gap: "8px" })}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyInvite(invite.code)}
                    className={css({
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    })}
                  >
                    <Copy size={14} />
                    コピー
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteInvite(invite.id)}
                    className={css({
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "danger.default",
                      borderColor: "danger.default",
                      _hover: {
                        background: "danger.default",
                        color: "text.bright",
                      },
                    })}
                  >
                    <Trash2 size={14} />
                    削除
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </Card.Body>
      </Card.Root>
    </div>
  );
}
