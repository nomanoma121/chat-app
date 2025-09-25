import { Toast } from "~/components/ui/toast";

export const toaster = Toast.createToaster({
	placement: "top-end",
	removeDelay: 5000,
});

export const useToast = () => {
	const success = (title: string, description?: string) => {
		toaster.create({
			title,
			description,
			type: "success",
		});
	};

	const error = (title: string, description?: string) => {
		toaster.create({
			title,
			description,
			type: "error",
		});
	};

	const info = (title: string, description?: string) => {
		toaster.create({
			title,
			description,
			type: "info",
		});
	};

	const warning = (title: string, description?: string) => {
		toaster.create({
			title,
			description,
			type: "warning",
		});
	};

	return {
		success,
		error,
		info,
		warning,
	};
};
