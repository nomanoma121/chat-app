import { css } from "styled-system/css";
import { Tabs } from "~/components/features/tabs";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { GeneralTab } from "./internal/components/general-tab";
import { MembersTab } from "./internal/components/members-tab";
import { Text } from "~/components/ui/text";
import { Heading } from "~/components/ui/heading";

export default function ServerSetting() {
  const navigate = useNavigate();

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
        <Text className={css({ ml: "8px" })}>サーバーに戻る</Text>
      </Button>
      <Heading
        className={css({ color: "text.bright", mt: "12px", mb: "20px" })}
        size="xl"
      >
        サーバー設定
      </Heading>
      <Tabs.Root defaultValue="general" variant="enclosed">
        <Tabs.List
          className={css({
            bgColor: "bg.tertiary",
            border: "none",
          })}
        >
          <Tabs.Trigger value="general">一般</Tabs.Trigger>
          <Tabs.Trigger value="members">メンバー</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="general">
					<GeneralTab />
				</Tabs.Content>
        <Tabs.Content value="members">
          <MembersTab />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
