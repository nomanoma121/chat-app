import { css } from "styled-system/css";
import { GuildList } from "./guild-list";
import { GuildPanel } from "./guild-panel";

export const Sidebar = () => {
  return (
    <div className={css({
      width: "320px",
      height: "100vh",
      borderRight: "1px solid",
      bg: "bg.secondary",
      borderColor: "border.soft",
      display: "flex",
      flexDirection: "row",
    })}>
      <GuildList />
      <GuildPanel />
    </div>
  )
}
