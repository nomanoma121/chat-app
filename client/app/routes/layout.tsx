import { Outlet } from "react-router";
import { useAuthMe } from "~/api/gen/auth/auth";
import { useNavigate } from "react-router";

export default function Home() {
	const { data, error, isPending } = useAuthMe();
  const navigate = useNavigate();
  if (isPending) {
    return <p>Loading...</p>;
  }

  if (error?.code === 401) {
    navigate("/login");
    return;
  }

	return (
    <div>
      
      <Outlet />
    </div>
	);
}
