import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Field } from "~/components/ui/field";
import { FormLabel } from "~/components/ui/form-label";
import { css } from "styled-system/css";
import { Button } from "~/components/ui/button";
import { useNavigate } from "react-router";

export default function CreateNewGuild() {
	const navigate = useNavigate();
  return (
    <div>
      {/* 中心にカードが来て、サーバーを作成する画面を表示する */}
      <Card.Root
        className={css({
          width: "500px",
          margin: "0 auto",
          marginTop: "100px",
          padding: "20px",
          background: "bg.secondary",
        })}
      >
        <Card.Header>
          <h1
            className={css({
              fontSize: "2xl",
              fontWeight: "bold",
            })}
          >
            新しいサーバーを作成
          </h1>
        </Card.Header>
        <Card.Body
          className={css({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          })}
        >
          <Field.Root className={css({ width: "100%" })}>
            <FormLabel color="white">サーバー名</FormLabel>
            <Field.Input
              placeholder="サーバー名を入力してください"
              className={css({ background: "bg.primary", border: "none" })}
            />
          </Field.Root>
          <Field.Root className={css({ width: "100%" })}>
            <FormLabel color="white">サーバーの説明</FormLabel>
            <Field.Textarea
              placeholder="サーバーの説明を入力してください"
              className={css({ background: "bg.primary", border: "none", resize: "none" })}
            />
          </Field.Root>
          <Button className={css({ width: "100%", marginTop: "10px" })} onClick={() => navigate("/servers/1/channels/1")}>
            サーバーを作成
          </Button>
        </Card.Body>
      </Card.Root>
    </div>
  );
}
