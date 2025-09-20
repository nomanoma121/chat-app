import { forwardRef } from "react";
import { Center, styled } from "styled-system/jsx";
import { css } from "styled-system/css";
import { Spinner } from "./spinner";
import {
	Button as StyledButton,
	type ButtonProps as StyledButtonProps,
} from "./styled/button";

interface ButtonLoadingProps {
	loading?: boolean;
	loadingText?: React.ReactNode;
}

export interface ButtonProps extends StyledButtonProps, ButtonLoadingProps {}

const disabledStyles = css({
	"&:disabled": {
		backgroundColor: "accent.default !important",
		color: "accent.subtle !important",
		opacity: 0.7,
		cursor: "not-allowed",
		"&:hover": {
			backgroundColor: "accent.default !important",
			color: "accent.subtle !important",
		}
	}
});

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(props, ref) => {
		const { loading, disabled, loadingText, children, className, ...rest } = props;

		const trulyDisabled = loading || disabled;

		return (
			<StyledButton
				disabled={trulyDisabled}
				ref={ref}
				className={`${className || ''} ${disabledStyles}`}
				{...rest}
			>
				{loading && !loadingText ? (
					<>
						<ButtonSpinner />
						<styled.span opacity={0}>{children}</styled.span>
					</>
				) : loadingText ? (
					loadingText
				) : (
					children
				)}
			</StyledButton>
		);
	},
);

Button.displayName = "Button";

const ButtonSpinner = () => (
	<Center
		inline
		position="absolute"
		transform="translate(-50%, -50%)"
		top="50%"
		insetStart="50%"
	>
		<Spinner
			width="1.1em"
			height="1.1em"
			borderWidth="1.5px"
			borderTopColor="fg.disabled"
			borderRightColor="fg.disabled"
		/>
	</Center>
);
