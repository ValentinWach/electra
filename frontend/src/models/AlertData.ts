export enum AlertType {
    info = "info",
    warning = "warning",
    error = "error",
    success = "success"
}

export interface AlertData {
    title?: string;
    message: string;
    type: AlertType;
}