import { Outlet } from "react-router";
import { useAuthMe } from "~/api/gen/auth/auth";
import { useNavigate } from "react-router";
import { UserPanel } from "~/components/feature/user-panel";
import { css } from "styled-system/css/css";

export default function Home() {
  const { data, error } = useAuthMe();
  const navigate = useNavigate();

  if (error?.code === 401) {
    navigate("/login");
    return;
  }

  return (
    <div>
      <div
        className={css({
          width: "280",
          position: "absolute",
          bottom: "2",
          left: "2",
          zIndex: "30",
        })}
      >
        <UserPanel name={data?.user.name} iconUrl={data?.user.iconUrl} />
      </div>
      <Outlet />
    </div>
  );
}
