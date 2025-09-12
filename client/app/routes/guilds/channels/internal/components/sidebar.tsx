import { css } from "styled-system/css";
import { GuildList } from "./guild-list";
import { GuildPanel } from "./guild-panel";
import { UserPanel } from "./user-panel";

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
      <div className={css({
        position: "absolute",
        bottom: "0",
        width: "320px",
        borderColor: "border.soft",
        bg: "bg.secondary",
        padding: "8px",
      })}>
        <UserPanel />
      </div>
    </div>
  )
}
