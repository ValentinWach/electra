import {ChartDataNum, ChartDataXYR} from '../../models/ChartData.ts';
import { Bubble } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    LinearScale,
    CategoryScale,
    PointElement
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, LinearScale, CategoryScale, PointElement);

export default function BubbleChartC(props: { data?: ChartDataXYR, xLabel?: string, yLabel?: string, xMin?: number, xMax?: number }) {
    const defaultData: ChartDataXYR = {
        datasets: [
            {
                data: [
                    { x: 20, y: 30, r: 5 },
                    { x: 40, y: 10, r: 5 },
                ] as { x: number; y: number; r: number }[],
                backgroundColor: ['#ff6384', '#ffcd56'],
            },
        ],
    };
    const data = props.data ?? defaultData;
    const options = {
        scales: {
            x: {
                beginAtZero: true,
                min: props.xMin ?? undefined,
                max: props.xMax ?? undefined,
                title: props.xLabel ? {
                    display: true,
                    text: props.xLabel,
                } : undefined,
            },
            y: {
                beginAtZero: true,
                title: props.xLabel ? {
                    display: true,
                    text: props.yLabel,
                } : undefined,
            }
        },
        plugins: {
            legend: {
                position: 'bottom' as const,
                display: false,
                labels: {
                    usePointStyle: true,
                },
            },
        },
    };

    return (
        <div>
            <Bubble data={data} options={options} style={{ height: '500px', width: '700px' }} />
        </div>
    );
}