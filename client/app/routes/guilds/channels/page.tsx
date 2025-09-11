import { Sidebar } from "./internal/components/sidebar";
import { css } from "styled-system/css";

export default function Channels() {
  return (
    <div className={css({ display: "flex" })}>
      <Sidebar />
      <div className={css({ padding: "4" })}>Channels Page</div>
    </div>
  );
}
