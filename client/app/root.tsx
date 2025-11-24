import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { Toast } from "~/components/ui/toast";
import { toaster } from "~/hooks/use-toast";
import { css } from "../styled-system/css";
import { wsClient } from "./api/websocket";
import stylesheet from "./app.css?url";
import { WebSocketProvider } from "./contexts/websocket";

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
	},
	{
		rel: "stylesheet",
		href: stylesheet,
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body
				className={css({
					bg: "bg.primary",
					color: "text.bright",
					fontFamily: "Inter, sans-serif",
					minH: "100vh",
				})}
				suppressHydrationWarning
			>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	// Create a QueryClient once per request (SSR) / once per app instance (CSR)
	const [queryClient] = useState(() => new QueryClient());

	return (
		<WebSocketProvider wsClient={wsClient}>
			<QueryClientProvider client={queryClient}>
				<Outlet />
				<Toast.Toaster toaster={toaster}>
					{(toast) => (
						<Toast.Root
							key={toast.id}
							className={css({
								bg: "bg.secondary",
								border: "1px solid",
								borderColor: "border.soft",
								color: "text.bright",
							})}
						>
							<Toast.Title
								className={css({
									color:
										toast.type === "success"
											? "#22c55e"
											: toast.type === "error"
												? "#ef4444"
												: toast.type === "warning"
													? "#f59e0b"
													: "#3b82f6",
								})}
							>
								{toast.title}
							</Toast.Title>
							<Toast.Description
								className={css({
									color: "text.medium",
								})}
							>
								{toast.description}
							</Toast.Description>
							<Toast.CloseTrigger
								className={css({
									color: "text.medium",
									_hover: {
										color: "text.bright",
									},
								})}
							/>
						</Toast.Root>
					)}
				</Toast.Toaster>
			</QueryClientProvider>
		</WebSocketProvider>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="pt-16 p-4 container mx-auto">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
