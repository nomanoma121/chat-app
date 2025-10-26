import type { AxiosError, AxiosRequestConfig } from "axios";
import Axios from "axios";
import { API_BASE_URL } from "~/constants";

export const axiosInstance = Axios.create({
	baseURL: API_BASE_URL,
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

export const customClient = <T>(config: AxiosRequestConfig): Promise<T> => {
	const controller = new AbortController();
	const promise = axiosInstance({ ...config, signal: controller.signal })
		.then(({ data }) => data)
		.catch((error: AxiosError) => {
			// AxiosErrorをStatus型互換のエラーオブジェクトに変換
			const statusError = {
				code: error.response?.status || 500,
				message: error.message,
				details: [],
			};
			throw statusError;
		});

	// @ts-expect-error
	promise.cancel = () => {
		controller.abort();
	};

	return promise;
};

export default customClient;
