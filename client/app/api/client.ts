import type { AxiosRequestConfig } from "axios";
import Axios from "axios";

export const axiosInstance = Axios.create({
	baseURL: "http://localhost:8001",
});

axiosInstance.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("authToken");

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

axiosInstance.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			localStorage.removeItem("authToken");
			if (typeof window !== "undefined") {
				window.location.href = "/login";
			}
		}
		return Promise.reject(error);
	},
);

export const customClient = <T>(config: AxiosRequestConfig): Promise<T> => {
	const controller = new AbortController();
	const promise = axiosInstance({ ...config, signal: controller.signal }).then(
		({ data }) => data,
	);

	// @ts-expect-error
	promise.cancel = () => {
		controller.abort();
	};

	return promise;
};

export default customClient;
