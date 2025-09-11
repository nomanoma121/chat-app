import { css } from "styled-system/css/css";
import { useListMyGuilds } from "~/api/gen/guild/guild";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Users } from "lucide-react";
import { useNavigate } from "react-router";

export default function Guild() {
  const { data, isPending, error } = useListMyGuilds();
	const navigate = useNavigate();

  if (data == null) {
    return;
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
          <Button onClick={() => navigate("/servers/new")}>新しいサーバーを作成する</Button>
        </div>
      </div>
      <div
        className={css({
          marginTop: "8",
        })}
      >
        {data.guilds.length === 0 && <p>参加しているサーバーがありません</p>}
        {data.guilds.length > 0 &&
          data.guilds.map((guild) => (
            <Card.Root
              key={guild.id}
              className={css({
                marginBottom: "4",
                cursor: "pointer",
                background: "bg.secondary",
                width: "50%",
                _hover: {
                  background: "bg.primary",
                },
              })}
							onClick={() => navigate(`/servers/${guild.id}/channels/1`)}
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
                  <p
                    className={css({
                      color: "text.secondary",
                    })}
                  >
                    <Users /> 12 のメンバー
                  </p>
                </div>
              </Card.Body>
            </Card.Root>
          ))}
      </div>
    </div>
  );
}
