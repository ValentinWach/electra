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
