import { css } from "styled-system/css";
import { Card } from "~/components/ui/card";
import { FormLabel } from "~/components/ui/form-label";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { IconButton } from "~/components/ui/icon-button";
import {
  ArrowLeft,
  Link2,
  Copy,
  Trash2,
  Plus,
  ChevronsUpDownIcon,
  CheckIcon,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Text } from "~/components/ui/text";
import { Heading } from "~/components/ui/heading";
import { useState } from "react";
import { NumberInput } from "~/components/ui/number-input";
import { Select, createListCollection } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";

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
    isUnlimited: false,
    maxUses: 10,
    expiryDays: "7",
    temporary: false,
  });

  const handleSettingChange = (
    key: string,
    value: string | boolean | number
  ) => {
    setInviteSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const expiryDaysCollection = createListCollection({
    items: [
      { label: "1日後", value: "1" },
      { label: "7日後", value: "7" },
      { label: "15日後", value: "15" },
      { label: "30日後", value: "30" },
    ],
  });

  const handleCreateInvite = () => {
    console.log("Creating invite with settings:", inviteSettings);
    // 実際のAPI呼び出し処理
  };

  const handleCopyInvite = async (code: string) => {
    const inviteUrl = `https://discord.gg/${code}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      console.log("招待リンクをコピーしました");
    } catch (err) {
      console.error("Failed to copy invite link:", err);
    }
  };

  const handleDeleteInvite = (id: string) => {
    console.log(`Deleting invite: ${id}`);
    // 実際の削除処理
  };

  return (
    <div
      className={css({
        width: "800px",
        margin: "0 auto",
        background: "bg.primary",
        paddingY: "10",
        paddingBottom: "20",
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

      <Heading
        className={css({ color: "text.bright", mt: "12px", mb: "20px" })}
        size="xl"
      >
        サーバー招待
      </Heading>

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
            <Plus size={20} className={css({ marginRight: "8px" })} />
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
          <div
            className={css({
              display: "flex",
              flexDirection: "row",
              gap: "16px",
            })}
          >
            <div
              className={css({
                width: "50%",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              })}
            >
              <Select.Root
                collection={expiryDaysCollection}
                positioning={{
                  placement: "right",
                  sameWidth: true,
                  strategy: "absolute",
                  flip: false,
                }}
                className={css({ width: "50%" })}
                defaultValue={["7"]}
              >
                <Select.Label className={css({ color: "text.bright" })}>
                  有効期限
                </Select.Label>
                <Select.Control>
                  <Select.Trigger color="text.bright">
                    <Select.ValueText placeholder="有効期限を選択" />
                    <ChevronsUpDownIcon />
                  </Select.Trigger>
                </Select.Control>
                <Select.Positioner>
                  <Select.Content
                    className={css({
                      color: "text.bright",
                      bg: "bg.secondary",
                      borderColor: "border.soft",
                    })}
                  >
                    {expiryDaysCollection.items.map((item) => (
                      <Select.Item
                        key={item.value}
                        item={item}
                        className={css({
                          _hover: {
                            bg: "bg.tertiary",
                            color: "text.bright",
                          },
                          _selected: {
                            bg: "bg.tertiary",
                            color: "text.bright",
                          },
                        })}
                      >
                        <Select.ItemText>
                          <Text>{item.label}</Text>
                        </Select.ItemText>
                        <Select.ItemIndicator>
                          <CheckIcon />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Select.Root>
            </div>

            <div
              className={css({
                width: "50%",
              })}
            >
              <div
                className={css({
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  mb: "7px",
                })}
              >
                <FormLabel color="text.bright">使用回数制限</FormLabel>
                <Switch
                  checked={inviteSettings.isUnlimited}
                  onCheckedChange={(details) =>
                    handleSettingChange("isUnlimited", details.checked)
                  }
                  className={css({ 
                    mx: "12px",
                    "& [data-part='control']": {
                      bg: "bg.quaternary",
                      _checked: {
                        bg: "accent.default"
                      }
                    }
                  })}
                >
                  <Text size="sm" className={css({ color: "text.bright" })}>
                    無制限
                  </Text>
                </Switch>
              </div>
              {!inviteSettings.isUnlimited && (
                <NumberInput
                  value={inviteSettings.maxUses.toString()}
                  onValueChange={(details) =>
                    handleSettingChange("maxUses", parseInt(details.value))
                  }
                  min={1}
                  max={50}
                  width="50%"
                />
              )}
            </div>
          </div>

          <Button
            onClick={handleCreateInvite}
            className={css({ alignSelf: "flex-end" })}
          >
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
              <Link2 size={20} className={css({ marginRight: "8px" })} />
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
              })}
            >
              <div
                className={css({
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                })}
              >
                <div className={css({ flex: 1 })}>
                  <div
                    className={css({
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      mb: "8px",
                    })}
                  >
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
                        background:
                          invite.uses >= (invite.maxUses || 999)
                            ? "danger.default"
                            : "accent.default",
                        color: "text.bright",
                      })}
                    >
                      {invite.uses}回使用
                    </Badge>
                  </div>

                  <div
                    className={css({
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    })}
                  >
                    <Text
                      className={css({ fontSize: "sm", color: "text.medium" })}
                    >
                      作成者: {invite.creator}
                    </Text>
                    <Text
                      className={css({ fontSize: "sm", color: "text.medium" })}
                    >
                      作成日: {invite.createdAt}
                    </Text>
                    {invite.expiresAt && (
                      <Text
                        className={css({
                          fontSize: "sm",
                          color: "text.medium",
                        })}
                      >
                        期限: {invite.expiresAt}
                      </Text>
                    )}
                    {invite.maxUses && (
                      <Text
                        className={css({
                          fontSize: "sm",
                          color: "text.medium",
                        })}
                      >
                        最大使用回数: {invite.maxUses}回
                      </Text>
                    )}
                  </div>
                </div>

                <div
                  className={css({
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                  })}
                >
                  <IconButton
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyInvite(invite.code)}
                    className={css({
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "text.medium",
                      borderColor: "border.soft",
                      _hover: {
                        background: "bg.quaternary",
                        color: "text.bright",
                      },
                    })}
                  >
                    <Copy size={14} />
                  </IconButton>
                  <IconButton
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
                  </IconButton>
                </div>
              </div>
            </div>
          ))}
        </Card.Body>
      </Card.Root>
    </div>
  );
}
