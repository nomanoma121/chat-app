import { Outlet, useNavigate } from "react-router";
import { css } from "styled-system/css";
import { useAuthMe } from "~/api/gen/auth/auth";
import { UserPanel } from "~/components/features/user-panel";
import { useLocation } from "react-router";

export default function ChannelLayout() {
  const { data, error } = useAuthMe();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthRoute =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register");

  if (!isAuthRoute && error?.code === 401) {
    navigate("/login");
    return;
  }

  return (
    <div>
      <Outlet />
      <div
        className={css({
          position: "fixed",
          bottom: "0",
          left: "0",
          width: "320px",
          borderColor: "border.soft",
          padding: "8px",
          zIndex: 1000,
        })}
      >
        <UserPanel />
      </div>
    </div>
  );
}
