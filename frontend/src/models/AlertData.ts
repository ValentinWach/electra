export enum AlertType {
    info = "info",
    warning = "warning",
    error = "error"
}

export interface AlertData {
    title?: string;
    message: string;
    type: AlertType;
}