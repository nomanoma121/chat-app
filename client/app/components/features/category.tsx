import { ChevronRight, Plus } from "lucide-react";
import {
	createContext,
	forwardRef,
	type ReactNode,
	useContext,
	useState,
} from "react";
import { css, cva } from "styled-system/css";
import { Channel, type ChannelData, type ChannelProps } from "./channel";

// Context for sharing state between Category components
interface CategoryContextValue {
	isExpanded: boolean;
	onToggle: () => void;
	onAddChannel?: () => void;
}

const CategoryContext = createContext<CategoryContextValue | undefined>(
	undefined,
);

const useCategoryContext = () => {
	const context = useContext(CategoryContext);
	if (!context) {
		throw new Error(
			"Category compound components must be used within a Category",
		);
	}
	return context;
};

// Root Category component
const categoryStyles = cva({
	base: {
		margin: "16px 8px 0 8px",
	},
});

interface CategoryProps {
	children: ReactNode;
	defaultExpanded?: boolean;
	onAddChannel?: () => void;
	className?: string;
}

const CategoryRoot = forwardRef<HTMLDivElement, CategoryProps>((props, ref) => {
	const { children, defaultExpanded = true, onAddChannel, className } = props;
	const [isExpanded, setIsExpanded] = useState(defaultExpanded);

	const handleToggle = () => {
		setIsExpanded((prev) => !prev);
	};

	const contextValue: CategoryContextValue = {
		isExpanded,
		onToggle: handleToggle,
		onAddChannel,
	};

	return (
		<CategoryContext.Provider value={contextValue}>
			<div
				ref={ref}
				className={[categoryStyles(), className].filter(Boolean).join(" ")}
			>
				{children}
			</div>
		</CategoryContext.Provider>
	);
});

CategoryRoot.displayName = "Category";

// Category Title component
const titleStyles = cva({
	base: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		gap: "4px",
		padding: "6px 8px",
		fontSize: "xs",
		fontWeight: "bold",
		color: "text.medium",
		textTransform: "uppercase",
		letterSpacing: "0.5px",
		transition: "all 0.1s ease",
	},
});

const titleLeftStyles = cva({
	base: {
		display: "flex",
		alignItems: "center",
		gap: "4px",
		cursor: "pointer",
		transition: "all 0.1s ease",
		_hover: {
			color: "text.bright",
		},
	},
});

const addButtonStyles = cva({
	base: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "18px",
		height: "18px",
		borderRadius: "2px",
		cursor: "pointer",
		opacity: "0",
		transition: "all 0.1s ease",
		_hover: {
			bgColor: "bg.tertiary",
			color: "text.bright",
		},
	},
	variants: {
		visible: {
			true: {
				opacity: "1",
			},
		},
	},
});

const chevronStyles = cva({
	base: {
		color: "inherit",
		transition: "transform 0.1s ease",
	},
	variants: {
		expanded: {
			true: {
				transform: "rotate(90deg)",
			},
		},
	},
});

interface TitleProps {
	children: ReactNode;
	className?: string;
}

const Title = forwardRef<HTMLDivElement, TitleProps>((props, ref) => {
	const { children, className } = props;
	const { isExpanded, onToggle, onAddChannel } = useCategoryContext();
	const [isHovered, setIsHovered] = useState(false);

	const handleAddChannel = (e: React.MouseEvent) => {
		e.stopPropagation();
		onAddChannel?.();
	};

	return (
		<div
			ref={ref}
			className={[titleStyles(), className].filter(Boolean).join(" ")}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<div className={titleLeftStyles()} onClick={onToggle}>
				<div className={chevronStyles({ expanded: isExpanded })}>
					<ChevronRight size={14} />
				</div>
				<span>{children}</span>
			</div>
			{onAddChannel && (
				<div
					className={addButtonStyles({ visible: isHovered })}
					onClick={handleAddChannel}
				>
					<Plus size={16} />
				</div>
			)}
		</div>
	);
});

Title.displayName = "Category.Title";

// Category Channel wrapper
interface CategoryChannelProps extends ChannelProps {
	children?: never; // Prevent children since Channel manages its own content
}

const CategoryChannel = forwardRef<HTMLDivElement, CategoryChannelProps>(
	(props, ref) => {
		const { channel, onSelect, className, ...rest } = props;
		const { isExpanded } = useCategoryContext();

		if (!isExpanded) {
			return null;
		}

		return (
			<Channel
				ref={ref}
				channel={channel}
				onSelect={onSelect}
				className={className}
				{...rest}
			/>
		);
	},
);

CategoryChannel.displayName = "Category.Channel";

// Content container for custom content
const contentStyles = cva({
	base: {
		overflow: "hidden",
		transition: "all 0.2s ease",
	},
});

interface ContentProps {
	children: ReactNode;
	className?: string;
}

const Content = forwardRef<HTMLDivElement, ContentProps>((props, ref) => {
	const { children, className } = props;
	const { isExpanded } = useCategoryContext();

	if (!isExpanded) {
		return null;
	}

	return (
		<div
			ref={ref}
			className={[contentStyles(), className].filter(Boolean).join(" ")}
		>
			{children}
		</div>
	);
});

Content.displayName = "Category.Content";

// Export the compound component
export const Category = Object.assign(CategoryRoot, {
	Title,
	Channel: CategoryChannel,
	Content,
});

export type { CategoryProps, ChannelData };
