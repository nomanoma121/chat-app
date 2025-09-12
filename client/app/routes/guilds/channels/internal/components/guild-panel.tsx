import { Settings, UserRoundPlus } from "lucide-react";
import { css } from "styled-system/css";
import { Category } from "~/components/features/category";
import { Heading } from "~/components/ui/heading";
import { useNavigate } from "react-router";
import { IconButton } from "~/components/ui/icon-button";

// Demo data
const textChannels = [
  { id: "general", name: "general", isSelected: true },
  { id: "random", name: "random", unreadCount: 3 },
  { id: "announcements", name: "announcements", mentionCount: 2 },
  { id: "help", name: "help" },
];

const projectChannels = [
  { id: "dev", name: "development", mentionCount: 1 },
  { id: "design", name: "ui-design", unreadCount: 5 },
  { id: "testing", name: "testing" },
];

export const GuildPanel = () => {
  const handleChannelSelect = (channelId: string) => {
    console.log("Selected channel:", channelId);
  };
  const navigate = useNavigate();
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

      <Category onChannelSelect={handleChannelSelect}>
        <Category.Title>Text Channels</Category.Title>
        {textChannels.map((channel) => (
          <Category.Channel key={channel.id} channel={channel} />
        ))}
      </Category>

      <Category onChannelSelect={handleChannelSelect}>
        <Category.Title>Project</Category.Title>
        {projectChannels.map((channel) => (
          <Category.Channel key={channel.id} channel={channel} />
        ))}
      </Category>
    </div>
  );
};
