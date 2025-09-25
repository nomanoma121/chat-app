import { Users } from "lucide-react";
import { useNavigate } from "react-router";
import { css } from "styled-system/css/css";
import { useListMyGuilds } from "~/api/gen/guild/guild";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Spinner } from "~/components/ui/spinner";
import { Text } from "~/components/ui/text";

export default function Guild() {
  const { data, isPending, error } = useListMyGuilds();
  const navigate = useNavigate();

  if (isPending) {
    return (
      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        })}
      >
        <Spinner size="lg" />
        <Text className={css({ mt: "4", color: "text.medium" })}>
          サーバー一覧を読み込み中...
        </Text>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={css({
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        })}
      >
        <p>サーバー一覧の読み込みに失敗しました</p>
      </div>
    );
  }

  return (
    <div>
      <div
        className={css({
          display: "flex",
        })}
      >
        <div>
          <h1
            className={css({
              fontSize: "2xl",
              fontWeight: "bold",
              mb: "4",
            })}
          >
            サーバー一覧
          </h1>
          <p>参加しているサーバーを選択してください</p>
        </div>
        <div className={css({ marginLeft: "auto" })}>
          <Button onClick={() => navigate("/servers/new")}>
            新しいサーバーを作成する
          </Button>
        </div>
      </div>
      <div
        className={css({
          marginTop: "8",
        })}
      >
        {(!data || data.guilds.length === 0) && (
          <div
            className={css({
              textAlign: "center",
              padding: "8",
              color: "fg.muted",
            })}
          >
            <p>参加しているサーバーがありません</p>
            <p className={css({ fontSize: "sm", marginTop: "2" })}>
              新しいサーバーを作成するか、招待コードで参加してください
            </p>
          </div>
        )}
        <div
          className={css({
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "4",
          })}
        >
          {data.guilds.length > 0 &&
            data.guilds.map((guild) => (
              <Card.Root
                key={guild.id}
                className={css({
                  cursor: "pointer",
                  background: "bg.secondary",
                  _hover: {
                    background: "bg.quaternary",
                    borderColor: "accent.default",
                  },
                })}
                onClick={() =>
                  navigate(
                    `/servers/${guild.id}/channels/${guild.defaultChannelId}`
                  )
                }
              >
                <Card.Body
                  className={css({
                    display: "flex",
                    alignItems: "center",
                    padding: "4",
                    gap: "4",
                  })}
                >
                  <div>
                    <h2
                      className={css({
                        fontSize: "xl",
                        fontWeight: "bold",
                      })}
                    >
                      {guild.name}
                    </h2>
                  </div>
                  <div
                    className={css({
                      display: "flex",
                      alignItems: "center",
                    })}
                  >
                    <Users className={css({ marginRight: "2" })} />{" "}
                    {guild.memberCount} のメンバー
                  </div>
                </Card.Body>
              </Card.Root>
            ))}
        </div>
      </div>
    </div>
  );
}
