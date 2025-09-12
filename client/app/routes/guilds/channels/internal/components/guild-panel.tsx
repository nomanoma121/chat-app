import { css } from "styled-system/css";
import { Category } from "~/components/features/category";

// Demo data
const textChannels = [
  { id: 'general', name: 'general', isSelected: true },
  { id: 'random', name: 'random', unreadCount: 3 },
  { id: 'announcements', name: 'announcements', mentionCount: 2 },
  { id: 'help', name: 'help' }
];

const projectChannels = [
  { id: 'dev', name: 'development', mentionCount: 1 },
  { id: 'design', name: 'ui-design', unreadCount: 5 },
  { id: 'testing', name: 'testing' }
];

export const GuildPanel = () => {
  const handleChannelSelect = (channelId: string) => {
    console.log('Selected channel:', channelId);
  };

  return (
    <div className={css({
      color: "white",
      width: "250px",
      bg: "bg.secondary"
    })}>
      <Category onChannelSelect={handleChannelSelect}>
        <Category.Title>Text Channels</Category.Title>
        {textChannels.map(channel => (
          <Category.Channel key={channel.id} channel={channel} />
        ))}
      </Category>

      <Category onChannelSelect={handleChannelSelect}>
        <Category.Title>Project</Category.Title>
        {projectChannels.map(channel => (
          <Category.Channel key={channel.id} channel={channel} />
        ))}
      </Category>
    </div>
  )
}
