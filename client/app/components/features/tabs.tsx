import React, { createContext, useContext, useState } from "react";
import { css, cx } from "styled-system/css";

interface TabsContextValue {
	activeTab: string;
	setActiveTab: (value: string) => void;
	variant?: "default" | "enclosed";
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

const useTabsContext = () => {
	const context = useContext(TabsContext);
	if (!context) {
		throw new Error("Tabs components must be used within Tabs.Root");
	}
	return context;
};

interface TabsRootProps {
	children: React.ReactNode;
	defaultValue: string;
	variant?: "default" | "enclosed";
	className?: string;
}

const Root = ({
	children,
	defaultValue,
	variant = "default",
	className,
}: TabsRootProps) => {
	const [activeTab, setActiveTab] = useState(defaultValue);

	return (
		<TabsContext.Provider value={{ activeTab, setActiveTab, variant }}>
			<div className={cx(css({ width: "100%" }), className)}>{children}</div>
		</TabsContext.Provider>
	);
};

interface TabsListProps {
	children: React.ReactNode;
	className?: string;
}

const List = ({ children, className }: TabsListProps) => {
	const { variant } = useTabsContext();

	const baseStyles = css({
		display: "flex",
		borderBottom: variant === "default" ? "1px solid" : "none",
		borderColor: variant === "default" ? "border.default" : "transparent",
		bgColor: variant === "enclosed" ? "bg.primary" : "transparent",
		borderRadius: variant === "enclosed" ? "md" : "0",
		padding: variant === "enclosed" ? "4px" : "0",
		gap: variant === "enclosed" ? "2px" : "0",
	});

	return <div className={cx(baseStyles, className)}>{children}</div>;
};

interface TabsTriggerProps {
	children: React.ReactNode;
	value: string;
	className?: string;
	asChild?: boolean;
}

const Trigger = ({ children, value, className, asChild }: TabsTriggerProps) => {
	const { activeTab, setActiveTab, variant } = useTabsContext();
	const isActive = activeTab === value;

	const baseStyles = css({
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		padding: variant === "enclosed" ? "8px 16px" : "12px 16px",
		cursor: "pointer",
		transition: "all 0.2s ease",
		borderRadius: variant === "enclosed" ? "sm" : "0",
		background: "transparent",
		fontSize: "sm",
		fontWeight: isActive ? "medium" : "normal",
		color: isActive ? "text.bright" : "text.medium",
		bgColor: isActive ? "bg.primary" : "transparent",
		flex: "1",
		_hover: {
			color: "text.bright",
			bgColor: isActive ? "bg.primary" : "bg.quaternary",
		},
		_focus: {
			outline: "none",
		},
	});

	const handleClick = () => {
		setActiveTab(value);
	};

	if (asChild && React.isValidElement(children)) {
		return React.cloneElement(children as React.ReactElement<any>, {
			onClick: handleClick,
			className: cx(baseStyles, (children.props as any).className, className),
			role: "tab",
			"aria-selected": isActive,
			tabIndex: isActive ? 0 : -1,
		});
	}

	return (
		<button
			onClick={handleClick}
			className={cx(baseStyles, className)}
			role="tab"
			aria-selected={isActive}
			tabIndex={isActive ? 0 : -1}
		>
			{children}
		</button>
	);
};

interface TabsContentProps {
	children: React.ReactNode;
	value: string;
	className?: string;
}

const Content = ({ children, value, className }: TabsContentProps) => {
	const { activeTab } = useTabsContext();
	const isActive = activeTab === value;

	if (!isActive) return null;

	const baseStyles = css({
		padding: "16px 0",
		animation: "fadeIn 0.2s ease-in-out",
	});

	return (
		<div
			className={cx(baseStyles, className)}
			role="tabpanel"
			aria-hidden={!isActive}
		>
			{children}
		</div>
	);
};

export const Tabs = {
	Root,
	List,
	Trigger,
	Content,
};
