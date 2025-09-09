import { useLogin, useRegister } from "../api/gen/auth/auth";

import type {
  LoginRequest,
  RegisterRequest,
} from "../api/gen/userProto.schemas";

export const useAuth = () => {
  const {
    mutateAsync: loginMutationAsync,
    isPending: isLoginPending,
    error: loginError,
  } = useLogin();
  const {
    mutateAsync: registerMutationAsync,
    isPending: isRegisterPending,
    error: registerError,
  } = useRegister();

  const register = async (data: RegisterRequest) => {
    try {
      const response = await registerMutationAsync({ data });
      return response;
    } catch (error) {
      console.error("Register failed:", error);
      return error;
    }
  };

  const login = async (data: LoginRequest) => {
    try {
      const response = await loginMutationAsync({ data });
      // JWTをローカルストレージに保存
      localStorage.setItem("token", response.token);
      return response;
    } catch (error) {
      console.error("Login failed:", error);
      return error;
    }
  };

  return {
    login: {
      exec: login,
      isPending: isLoginPending,
      error: loginError,
    },
    register: {
      exec: register,
      isPending: isRegisterPending,
      error: registerError,
    },
  };
};
