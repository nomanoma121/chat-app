import { useLogin } from "../api/gen/auth/auth";

import type {
  LoginRequest,
} from "../api/gen/userProto.schemas";

export const useLoginMutation = () => {
  const { mutateAsync: loginMutateAsync, isPending, error } = useLogin();

  const loginMutationAsync = async (data: LoginRequest) => {
    try {
      const response = await loginMutateAsync({ data });
      localStorage.setItem("authToken", response.token);
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  }

  return { mutateAsync: loginMutationAsync, isPending, error };
}
