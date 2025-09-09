import Axios from "axios";
import type { AxiosRequestConfig } from "axios";

export const axiosInstance = Axios.create({
	baseURL: "http://localhost:8000",
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
	const source = Axios.CancelToken.source();
	const promise = axiosInstance({ ...config, cancelToken: source.token }).then(
		({ data }) => data,
	);

	// @ts-expect-error
	promise.cancel = () => {
		source.cancel("Query was cancelled");
	};

	return promise;
};

export default customClient;
