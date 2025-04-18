import { useTheme } from "next-themes";
import { toast, ToastOptions } from "react-hot-toast";

export type ToastType = "success" | "error" | "info" | "warning" | "loading" | "custom" | "promise";

interface ToastProps {
    message: string;
    duration?: number;
    theme?: "light" | "dark" | "colored";
    isUnique?: boolean;
    icon?: string;
}

interface PromiseToastProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    promise: Promise<any>;
    loading: string;
    success?: string;
    error: string;
    duration?: number;
    theme?: "light" | "dark" | "colored";
    isUnique?: boolean;
    icon?: string; // Optional icon for promise toast
}

const useToast = () => {
    const { resolvedTheme } = useTheme();
    const defaultOptions = (props: ToastProps): ToastOptions => ({
        duration: props.duration || 3000,
        position: "top-right",
        style: resolvedTheme !== "dark"
            ? { background: "#1E1E1E", color: "#E0E0E0" }
            : { background: "#FFFFFF", color: "#212121" },
        id: props.isUnique !== false ? props.message : undefined,
        icon: props.icon === "" ? undefined : props.icon,
    });
    const success = (props: ToastProps) => toast.success(props.message, { ...defaultOptions(props), icon: props.icon ?? undefined });
    const error = (props: ToastProps) => toast.error(props.message, { ...defaultOptions(props), icon: props.icon ?? undefined });
    const info = (props: ToastProps) => toast(props.message, { ...defaultOptions(props), icon: props.icon ?? undefined });
    const warning = (props: ToastProps) => toast(props.message, { ...defaultOptions(props), icon: props.icon ?? undefined });
    const loading = (props: ToastProps) => toast.loading(props.message, { ...defaultOptions(props), icon: props.icon ?? "⏳" });
    const custom = (props: ToastProps) => toast(props.message, { ...defaultOptions(props) });

    const showPromiseToast = ({ promise, loading, success, error, duration, theme, isUnique }: PromiseToastProps) => {
        return toast.promise(
            promise,
            {
                loading,
                success,
                error,
            },
            defaultOptions({ message: loading, duration, theme, isUnique })
        );
    };


    return { success, error, info, warning, loading, custom, showPromiseToast };
};

export default useToast;
