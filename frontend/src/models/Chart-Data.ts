export interface ChartDataset {
    data: number[];
    backgroundColor: string[];
    borderColor?: string[];
    borderWidth?: number;
}

export interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

export interface DropdownItem {
    label: string;
    id: number;
}

export interface DropdownType {
    label: string,
    items: DropdownItem[];
}