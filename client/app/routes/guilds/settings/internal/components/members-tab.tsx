import { css } from "styled-system/css";
import { Card } from "~/components/ui/card";
import { Avatar } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { Users } from "lucide-react";
import { UserRoundPlus } from "lucide-react";
import { Heading } from "~/components/ui/heading";

const mockMembers = [
  {
    id: "1",
    name: "管理者",
    role: "admin",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
    joinedAt: "2024/1/10",
  },
  {
    id: "2",
    name: "開発者A",
    role: "member",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
    joinedAt: "2024/1/15",
  },
  {
    id: "3",
    name: "デザイナーB",
    role: "member",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b9b8d85d?w=32&h=32&fit=crop&crop=face",
    joinedAt: "2024/1/20",
  },
  {
    id: "4",
    name: "テスターC",
    role: "member",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face",
    joinedAt: "2024/1/25",
  },
];

export const MembersTab = () => {
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
            <Users size={20} className={css({ marginRight: "8px" })} />
            メンバー管理
          </Heading>
          <Text
            className={css({
              fontSize: "sm",
              color: "text.medium",
              marginBottom: "16px",
            })}
          >
            サーバーのメンバーを管理できます
          </Text>
          <div
            className={css({
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "8px",
              justifyContent: "space-between",
            })}
          >
            <Input
              placeholder="メンバーを検索"
              size="md"
              className={css({
                flex: "1",
                minWidth: "200px",
                background: "bg.secondary",
                borderColor: "border.soft",
                color: "text.bright",
              })}
            />
            <Button
              variant="solid"
              size="md"
              className={css({
                color: "text.bright",
              })}
            >
              <UserRoundPlus size={16} />
              新しいメンバーを招待
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {mockMembers.map((member) => (
            <Card.Root
              key={member.id}
              className={css({
                display: "flex",
                height: "20",
                bgColor: "bg.secondary",
                borderColor: "border.soft",
                borderWidth: "1px",
                borderRadius: "md",
                marginBottom: "8px",
              })}
            >
              <Card.Body
                className={css({
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  height: "100%",
                  padding: "0",
                  paddingX: "6",
                })}
              >
                <div className={css({ display: "flex", alignItems: "center" })}>
                  <Avatar
                    name={member.name}
                    src={member.avatar}
                    size="sm"
                    className={css({
                      width: "32px",
                      height: "32px",
                      marginRight: "12px",
                    })}
                  />
                  <div
                    className={css({
                      display: "flex",
                      alignItems: "center",
                      flexDirection: "column",
                    })}
                  >
                    <Text
                      className={css({
                        color: "text.bright",
                      })}
                      size="sm"
                      fontWeight="medium"
                    >
                      {member.name}
                    </Text>
                    {member.role === "admin" ? (
                      <Badge
                        className={css({
                          marginLeft: "8px",
                          background: "accent.default",
                          color: "text.bright",
                          fontSize: "xs",
                          fontWeight: "medium",
                          borderRadius: "sm",
                          border: "none",
                        })}
                        size="sm"
                      >
                        管理者
                      </Badge>
                    ) : (
                      <Badge
                        className={css({
                          marginLeft: "8px",
                          background: "bg.tertiary",
                          color: "text.medium",
                          fontSize: "xs",
                          fontWeight: "medium",
                          borderRadius: "sm",
                          border: "none",
                        })}
                        size="sm"
                      >
                        メンバー
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className={css({ ml: "12px", color: "danger.default" })}
                >
                  キック
                </Button>
              </Card.Body>
            </Card.Root>
          ))}
        </Card.Body>
      </Card.Root>
    </div>
  );
};
