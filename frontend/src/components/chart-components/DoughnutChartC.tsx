import {ChartDataNum} from '../../models/ChartData.ts';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

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
                },
            },
        },
    };
    const partialCircleOptions = {
        circumference: 180,
        rotation: 270,
        cutout: '40%',
        layout: {
            padding: 20,

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
        hover: {
            mode: 'index',
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
