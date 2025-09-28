import { LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router";
import { css } from "styled-system/css";
import { useGetCurrentUser } from "~/api/gen/user/user";
import { Avatar } from "~/components/ui/avatar";
import { Card } from "~/components/ui/card";
import { Text } from "~/components/ui/text";

export const UserPanel = () => {
	const { data } = useGetCurrentUser();
	const navigate = useNavigate();

	const handleLogout = () => {
		localStorage.removeItem("authToken");
		navigate("/login");
	};
	return (
		<Card.Root
			className={css({
				width: "100%",
				height: "14",
				background: "bg.primary",
				borderRadius: "md",
				boxShadow: "md",
				borderWidth: "1px",
				borderColor: "border.soft",
			})}
		>
			<Card.Body
				className={css({
					display: "flex",
					flexDirection: "row",
					height: "100%",
					padding: "1",
					gap: "1",
				})}
			>
				<div
					className={css({
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						height: "100%",
						borderRadius: "md",
						padding: "3",
						width: "90%",
					})}
				>
					<Avatar
						src={data?.user.iconUrl}
						name={data?.user.name ?? "Unknown User"}
						className={css({
							width: "7",
							height: "7",
						})}
					/>
					<Text
						className={css({
							marginLeft: "2",
							color: "text.bright",
						})}
					>
						{data?.user.name ?? "Unknown User"}
					</Text>
				</div>
				<div className={css({ display: "flex", alignItems: "center", gap: "1" })}>
					<div
						className={css({
							display: "flex",
							alignItems: "center",
							padding: "2",
							height: "8",
							_hover: {
								cursor: "pointer",
								background: "bg.quaternary",
								borderRadius: "md",
							},
						})}
					>
						<Settings
							className={css({
								width: "4",
								height: "4",
								color: "text.bright",
							})}
							onClick={() => navigate("/settings")}
						/>
					</div>
					<div
						className={css({
							display: "flex",
							alignItems: "center",
							padding: "2",
							height: "8",
							_hover: {
								cursor: "pointer",
								background: "danger.default",
								borderRadius: "md",
							},
						})}
					>
						<LogOut
							className={css({
								width: "4",
								height: "4",
								color: "text.bright",
							})}
							onClick={handleLogout}
						/>
					</div>
				</div>
			</Card.Body>
		</Card.Root>
	);
};
