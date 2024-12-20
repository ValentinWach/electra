import {ChartData} from '../models/ChartData.ts';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DoughnutChart(props: { data?: ChartData, fullCircle?: Boolean }) { //TODO: When use "props" and when {name}{type} syntax?
    const fullCircle = props.fullCircle ?? false;
    const defaultData: ChartData = {
        labels: ['Filled', 'Empty'],
        datasets: [{data: [66, 34], backgroundColor: ['#ff6384', '#e0e0e0'], borderWidth: 0,},],
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
        circumference: 220,
        rotation: 70,
        cutout: '40%',
        layout: {
            padding: 0,
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

    const options = fullCircle ? fullCircleOptions : partialCircleOptions;

    return (
        <div className={""}>
            <Doughnut data={data} options={options}  />
        </div>
    );
};
