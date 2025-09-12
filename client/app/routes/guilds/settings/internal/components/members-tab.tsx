import { css } from "styled-system/css";
import { Card } from "~/components/ui/card";
import { Avatar } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Search, MoreHorizontal, Crown, Shield, UserCheck } from "lucide-react";

const mockMembers = [
  {
    id: "1",
    name: "管理者",
    displayId: "@admin",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
    role: "オーナー",
    roleColor: "#fbbf24",
    status: "オンライン",
    joinedAt: "2024/1/10"
  },
  {
    id: "2", 
    name: "開発者A",
    displayId: "@dev-a",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
    role: "開発者",
    roleColor: "#3b82f6",
    status: "オンライン",
    joinedAt: "2024/1/15"
  },
  {
    id: "3",
    name: "デザイナーB", 
    displayId: "@designer-b",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b9b8d85d?w=32&h=32&fit=crop&crop=face",
    role: "デザイナー",
    roleColor: "#8b5cf6",
    status: "離席中",
    joinedAt: "2024/1/20"
  },
  {
    id: "4",
    name: "テスターC",
    displayId: "@tester-c", 
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face",
    role: "テスター",
    roleColor: "#10b981",
    status: "オフライン",
    joinedAt: "2024/1/25"
  }
];

const getRoleIcon = (role: string) => {
  switch (role) {
    case "オーナー":
      return <Crown size={14} />;
    case "開発者":
      return <Shield size={14} />;
    default:
      return <UserCheck size={14} />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "オンライン":
      return "#10b981";
    case "離席中":
      return "#f59e0b";
    case "オフライン":
      return "#6b7280";
    default:
      return "#6b7280";
  }
};

export const MembersTab = () => {
  return (
    <div className={css({
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    })}>
      {/* 検索・フィルター */}
      <Card.Root className={css({
        background: "bg.secondary",
      })}>
        <div className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px"
        })}>
          <h3 className={css({
            fontSize: "lg",
            fontWeight: "semibold", 
            color: "text.bright"
          })}>
            メンバー ({mockMembers.length})
          </h3>
          <Button>
            メンバーを招待
          </Button>
        </div>
        
        <div className={css({
          position: "relative",
          maxWidth: "300px"
        })}>
          <Search className={css({
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "fg.subtle"
          })} size={18} />
          <Input
            placeholder="メンバーを検索..."
            className={css({
              paddingLeft: "40px",
              background: "bg.primary",
              border: "none",
              color: "text.bright"
            })}
          />
        </div>
      </Card.Root>

      {/* メンバー一覧 */}
      <Card.Root className={css({
        background: "bg.secondary"
      })}>
        <Card.Body className={css({ padding: "0" })}>
          {mockMembers.map((member) => (
            <div
              key={member.id}
              className={css({
                display: "flex",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: "1px solid",
                borderColor: "border.soft",
                _hover: {
                  background: "bg.tertiary"
                },
                _last: {
                  borderBottom: "none"
                }
              })}
            >
              {/* アバターと状態 */}
              <div className={css({ position: "relative", marginRight: "12px" })}>
                <Avatar
                  name={member.name}
                  src={member.avatar}
                  size="md"
                />
                <div
                  className={css({
                    position: "absolute",
                    bottom: "0",
                    right: "0",
                    width: "12px",
                    height: "12px",
                    borderRadius: "full",
                    border: "2px solid",
                    borderColor: "bg.secondary"
                  })}
                  style={{ backgroundColor: getStatusColor(member.status) }}
                />
              </div>

              {/* ユーザー情報 */}
              <div className={css({ flex: "1", minWidth: "0" })}>
                <div className={css({
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "2px"
                })}>
                  <span className={css({
                    fontWeight: "semibold",
                    color: "text.bright",
                    truncate: true
                  })}>
                    {member.name}
                  </span>
                  <Badge
                    className={css({
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "xs",
                      color: "bg.primary"
                    })}
                    style={{ backgroundColor: member.roleColor }}
                  >
                    {getRoleIcon(member.role)}
                    {member.role}
                  </Badge>
                </div>
                <div className={css({
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "sm",
                  color: "text.medium"
                })}>
                  <span>{member.displayId}</span>
                  <span>•</span>
                  <span>参加日: {member.joinedAt}</span>
                </div>
              </div>

              {/* 操作メニュー */}
              <Button
                variant="ghost"
                size="sm"
                className={css({
                  color: "fg.subtle",
                  _hover: {
                    color: "fg.default"
                  }
                })}
              >
                <MoreHorizontal size={16} />
              </Button>
            </div>
          ))}
        </Card.Body>
      </Card.Root>
    </div>
  );
};
