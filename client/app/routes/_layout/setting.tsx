import { Outlet } from "react-router";
import { css } from "styled-system/css";

export default function SettingLayout() {
  return (
    <div
      className={css({
        margin: "6",
        width: "calc(100% - token(spacing.6) * 2)",
        height: "calc(100dvh - token(spacing.6) * 2)",
        overflow: "hidden",
        background: "white",
        borderRadius: "md",
      })}
    >
      <Outlet />
    </div>
  );
}
