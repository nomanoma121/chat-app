import { type ComponentProps, forwardRef, useState } from "react";
import { avatar } from "styled-system/recipes";
import type { AvatarVariantProps } from "styled-system/recipes";

export interface AvatarProps
	extends Omit<ComponentProps<"div">, "size">,
		AvatarVariantProps {
	name?: string;
	src?: string;
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>((props, ref) => {
	const { name, src, size = "md", className, ...rootProps } = props;
	const [imageError, setImageError] = useState(false);

	const handleImageError = () => {
		setImageError(true);
	};

	const styles = avatar({ size });

	return (
		<div
			ref={ref}
			className={[styles.root, className].filter(Boolean).join(" ")}
			{...rootProps}
		>
			{src && !imageError ? (
				<img
					src={src}
					alt={name || "Avatar"}
					onError={handleImageError}
					className={styles.image}
				/>
			) : (
				<span className={styles.fallback}>
					{getInitials(name) || <UserIcon />}
				</span>
			)}
		</div>
	);
});

Avatar.displayName = "Avatar";

const UserIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
	>
		<title>User Icon</title>
		<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
		<circle cx="12" cy="7" r="4" />
	</svg>
);

const getInitials = (name = "") =>
	name
		.split(" ")
		.map((part) => part[0])
		.splice(0, 2)
		.join("")
		.toUpperCase();
