interface ChartDataset {
    backgroundColor: string[];
    borderColor?: string[];
    borderWidth?: number;
}

interface ChartData {
    labels: string[];
}


export interface ChartDatasetNum extends ChartDataset{
    data: number[];
}

export interface ChartDataNum extends ChartData{
    datasets: ChartDatasetNum[];
}

export interface ChartDatasetXYR extends ChartDataset{
    data: { x: number; y: number; r: number }[];
}

export interface ChartDataXYR extends ChartData{
    datasets: ChartDatasetXYR[];
}
