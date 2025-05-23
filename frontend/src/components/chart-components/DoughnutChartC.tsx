import {ChartDataNum} from '../../models/ChartData.ts';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { toPadding } from 'chart.js/helpers';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DoughnutChart(props: { data?: ChartDataNum, fullCircle?: Boolean }) { //TODO: When use "props" and when {name}{type} syntax?
    const fullCircle = props.fullCircle ?? false;
    const defaultData: ChartDataNum = {
        labels: [],
        datasets: [],
    };
    const data = props.data ?? defaultData;
    const fullCircleOptions = {
        circumference: 360,
        rotation: 0,
        cutout: '0%',
        layout: {
            padding: 0,
        },
        plugins: {
            legend: {
                position: 'bottom' as const,
                display: true,
                labels: {
                    usePointStyle: true,
                    font: {
                        size: 13,
                        weight: '500',
                    },
                },
            },
        },
    };
    const partialCircleOptions = {
        circumference: 180,
        rotation: 270,
        cutout: '40%',
        layout: {
            padding: {
                left: 10,
                right: 10,
                top: 15,
                bottom: 15
            },
        },
        plugins: {
            legend: {
                position: 'bottom' as const,
                display: true,
                labels: {
                    usePointStyle: true,
                    font: {
                        size: 12,
                        weight: '500',
                    },
                },
            },
        },
        hover: {
            mode: 'index' as const,
            intersect: true,
        },
        elements: {
            arc: {
                hoverOffset: 15,
            }
        }
    };

    const options = fullCircle ? fullCircleOptions : partialCircleOptions;

    return (
        <div className="w-full max-w-[400px] sm:h-[250px] 2xl:h-[300px] h-auto">
            <Doughnut 
                data={data} 
                options={{
                    ...options,
                    maintainAspectRatio: false
                }} 
                style={{
                    width: '100%',
                    marginTop: fullCircle ? 'auto' : '-40px'
                }}
            />
        </div>
    );
};
