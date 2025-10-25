import { Spinner } from "~/components/ui/spinner";
import { Text } from "~/components/ui/text";
import { css } from "styled-system/css";

export const Loading = () => {
  return (
    <div
      className={css({
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "bg.primary",
      })}
    >
      <Spinner size="lg" />
      <Text className={css({ mt: "4", color: "text.medium" })}>
        メッセージを読み込み中...
      </Text>
    </div>
  );
};
