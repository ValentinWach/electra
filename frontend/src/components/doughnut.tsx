import {ChartData} from '../models/Chart-Data.ts';
import { Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DoughnutChart(props: { data?: ChartData }) {
    const defaultData: ChartData = {
        labels: ['Filled', 'Empty'],
        datasets: [{data: [66, 34], backgroundColor: ['#ff6384', '#e0e0e0'], borderWidth: 0,},],
    };
    const data = props.data ?? defaultData;
    const options = {
        circumference: 220,
        rotation: 70,
        cutout: '40%',
        //responsive: true,
        //maintainAspectRatio: true,
        layout: {
            padding: 0,
        },
        plugins: {
            legend: {
                position: 'bottom',
                display: false,
                labels: {
                    usePointStyle: true,
                },
            },
        },
    };

    return (
        <div className={""}>
            <Doughnut data={data} options={options}  />
        </div>
    );
};
