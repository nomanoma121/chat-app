import { css } from "styled-system/css";

interface NotFoundPageProps {
	title?: string;
	message?: string;
}

export const NotFoundPage = ({
	title = "ページが見つかりません",
	message = "お探しのページは削除されたか、名前が変更された可能性があります",
}: NotFoundPageProps = {}) => {
	return (
		<div
			className={css({
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				minHeight: "400px",
				backgroundColor: "bg.primary",
			})}
		>
			<div
				className={css({
					textAlign: "center",
					padding: "8",
					color: "fg.muted",
				})}
			>
				<h1
					className={css({
						fontSize: "4xl",
						fontWeight: "bold",
						marginBottom: "4",
						color: "text.medium",
					})}
				>
					404
				</h1>
				<p
					className={css({
						fontSize: "lg",
						fontWeight: "medium",
						marginBottom: "2",
					})}
				>
					{title}
				</p>
				<p className={css({ fontSize: "sm", marginTop: "2" })}>{message}</p>
			</div>
		</div>
	);
};
