import { Outlet } from "react-router";
import { css } from "styled-system/css";

export default function GuildListLayout() {
  return (
    <div className={css({ display: "flex", height: "100%", margin: "200px" })}>
      <Outlet />
    </div>
  );
}
