import { GuildIcon } from "~/components/ui/guild-icon";
import { css } from "styled-system/css";
import { IconButton } from "~/components/ui/icon-button";
import { MoveLeft } from "lucide-react";
import { useNavigate } from "react-router";

export const GuildList = () => {
  const navigate = useNavigate();
  const demoGuilds = [
    // 実際のサーバーにありそうな感じでいろんな風景の画像を設定
    {
      name: "Nature Lovers",
      src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=48&q=80",
    },
    {
      name: "Tech Geeks",
      src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=48&q=80",
    },
    {
      name: "Foodies",
      src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=48&q=80",
    },
    {
      name: "Travel Enthusiasts",
      src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=48&q=80",
    },
    {
      name: "Art & Design",
      src: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=48&q=80",
    },
    {
      name: "Music Fans",
      src: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=48&q=80",
    },
    {
      name: "Fitness Freaks",
      src: "https://images.unsplash.com/photo-1554284126-4c2b6f3b3f0b?auto=format&fit=crop&w=48&q=80",
    },
    {
      name: "Book Club",
      src: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=48&q=80",
    },
  ];
  return (
    <div
      className={css({
        width: "70px",
        height: "100vh",
        bg: "bg.secondary",
        borderColor: "border.soft",
        borderRightWidth: "1px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      })}
    >
      <div
        className={css({
          borderBottomWidth: "1px",
          borderColor: "border.soft",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2",
        })}
      >
        <IconButton
          variant="ghost"
          color="white"
          width="12"
          height="12"
          className={css({
            _hover: {
              bg: "accent.normal",
              color: "white",
            },
          })}
          onClick={() => navigate('/servers')}
        >
          <MoveLeft size={20} />
        </IconButton>
      </div>
      {demoGuilds.map((guild, index) => (
        <div
          key={index}
          className={css({
            marginTop: index === 0 ? "16px" : "8px",
            marginBottom: index === demoGuilds.length - 1 ? "16px" : "0",
            position: "relative",
          })}
        >
          <GuildIcon
            src={guild.src}
            name={guild.name}
            alt={guild.name}
            size={48}
          />
        </div>
      ))}
    </div>
  );
};
