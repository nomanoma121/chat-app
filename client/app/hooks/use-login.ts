import { AUTH_TOKEN } from "~/constants";
import { useLogin as useLoginMutate } from "../api/gen/auth/auth";
import type { LoginRequest } from "../api/gen/userProto.schemas";
import { wsClient } from "~/api/websocket";

export const useLogin = () => {
	const { mutateAsync: loginMutateAsync, isPending, error } = useLoginMutate();

	const loginMutationAsync = async (data: LoginRequest) => {
		localStorage.removeItem(AUTH_TOKEN);
		try {
			const response = await loginMutateAsync({ data });
			localStorage.setItem(AUTH_TOKEN, response.token);
			wsClient.recconnect();
		} catch (err) {
			console.error("Login failed:", err);
			throw err;
		}
	};

	return { mutateAsync: loginMutationAsync, isPending, error };
};
