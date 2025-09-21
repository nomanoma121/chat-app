import { Settings, UserRoundPlus } from "lucide-react";
import { useNavigate } from "react-router";
import { css } from "styled-system/css";
import { Category } from "~/components/features/category";
import { Heading } from "~/components/ui/heading";
import { IconButton } from "~/components/ui/icon-button";
import { Dialog } from "~/components/ui/dialog";
import { useOutletContext } from "react-router";
import type { GuildsContext } from "../../layout";

export const GuildPanel = () => {
  const { guild, isPending, error } = useOutletContext<GuildsContext>();
  const navigate = useNavigate();

  console.log(guild, isPending, error);
  return (
    <div
      className={css({
        color: "text.bright",
        width: "250px",
        bg: "bg.secondary",
      })}
    >
      <div
        className={css({
          borderBottomWidth: "1px",
          borderColor: "border.soft",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingX: "5",
          height: "12",
        })}
      >
        <Heading
          className={css({
            fontSize: "sm",
            color: "text.medium",
          })}
          onClick={() => navigate("/servers/1/settings")}
        >
          MYSERVER
        </Heading>
        <div className={css({ display: "flex", gap: "2" })}>
          <IconButton
            variant="ghost"
            size="sm"
            color="text.medium"
            className={css({
              _hover: {
                bgColor: "bg.tertiary",
                color: "text.bright",
              },
            })}
          >
            <UserRoundPlus
              size={16}
              onClick={() => navigate("/servers/1/invite")}
            />
          </IconButton>
          <IconButton
            variant="ghost"
            size="sm"
            color="text.medium"
            className={css({
              _hover: {
                bgColor: "bg.tertiary",
                color: "text.bright",
              },
            })}
          >
            <Settings
              size={16}
              onClick={() => navigate("/servers/1/settings")}
            />
          </IconButton>
        </div>
      </div>
      {guild?.categories?.map((category) => (
        <Category
          key={category.id}
          onChannelSelect={() =>
            navigate(`/servers/${guild.id}/channels/${category.id}`)
          }
          onAddChannel={() =>
            console.log(`Add channel to category: ${category.id}`)
          }
        >
          <Category.Title>{category.name}</Category.Title>
          {category.channels.map((channel) => (
            <Category.Channel key={channel.id} channel={channel} />
          ))}
        </Category>
      ))}
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <IconButton>+</IconButton>
        </Dialog.Trigger>
        <Dialog.Positioner>
          <Dialog.Content>
            <div>ほげほげのふがふがです</div>
            <Dialog.CloseTrigger>
              <IconButton>Close</IconButton>
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </div>
  );
};
