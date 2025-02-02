import {ChartDataXYR} from '../../models/ChartData.ts';
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

export default function BubbleChartC(props: { data?: ChartDataXYR, xLabel?: string, yLabel?: string, xMin?: number, xMax?: number, yMin?: number, yMax?: number }) {
    const defaultData: ChartDataXYR = {
        labels: [],
        datasets: [
            {
                data: [],
                backgroundColor: [],
            },
        ],
    };
    const data = props.data ?? defaultData;
    const options = {
        scales: {
            x: {
                min: props.xMin ?? undefined,
                max: props.xMax ?? undefined,
                title: props.xLabel ? {
                    display: true,
                    text: props.xLabel,
                } : undefined,
            },
            y: {
                max: props.yMax ?? undefined,
                min: props.yMin ?? undefined,
                title: props.yLabel ? {
                    display: true,
                    text: props.yLabel,
                } : undefined,
            }
        },
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        return `(${context.raw.x}, ${context.raw.y})`;
                    }
                }
            },
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
        <div className="w-full max-w-[1000px] sm:h-[350px] xl:h-[400px]">
            <Bubble data={data} options={options} style={{ width: '100%' }} />
        </div>
    );
}