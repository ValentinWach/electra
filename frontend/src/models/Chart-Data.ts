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

export interface dropdownItem {
    label: string;
    href: string;
}

export interface dropdown {
    items: dropdownItem[];
}