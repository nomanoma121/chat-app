import { css } from "styled-system/css";
import { GuildList } from "./guild-list";

export const Sidebar = () => {
  return (
    <div className={css({
      width: "320px",
      height: "100vh",
      borderRight: "1px solid",
      bg: "bg.secondary",
      borderColor: "border.soft",
    })}>
      <GuildList />
    </div>
  )
}
