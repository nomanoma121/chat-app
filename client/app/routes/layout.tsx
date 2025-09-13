import { Outlet, useNavigate } from "react-router";
import { useAuthMe } from "~/api/gen/auth/auth";

export default function ChannelLayout() {
	const { data, error } = useAuthMe();
	const navigate = useNavigate();

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
