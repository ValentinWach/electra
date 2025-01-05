import {ChartDataNum} from '../../models/ChartData.ts';
import {Bar} from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    LinearScale,
    CategoryScale,
    BarElement
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, LinearScale, CategoryScale, BarElement);

export default function BarchartC(props: { data?: ChartDataNum }) {
    const defaultData: ChartDataNum = {
        labels: ['Filled', 'Empty'],
        datasets: [{data: [66, 34], backgroundColor: ['#ff6384', '#e0e0e0'], borderWidth: 0,},],
    };
    const data = props.data ?? defaultData;
    const options = {
        scales: {
            y: {
                beginAtZero: true,
            }
        },
        layout: {
            padding: 0,
        },
        plugins: {
            legend: {
                position: "bottom" as const,
                display: false,
                labels: {
                    usePointStyle: true,
                },
            },
        },
    };

    return (
        <div>
            <Bar data={data} options={options} style={{ height: '500px', width: '700px'}}/>
        </div>
    );
};
