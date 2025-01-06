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
        labels: [],
        datasets: [],
    };
    const data = props.data ?? defaultData;
    const options = {
        scales: {
            y: {
                beginAtZero: true,
            }
        },
        maintainAspectRatio: false,
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
        <div className="w-full max-w-[700px] sm:h-[300px] xl:h-[350px]  h-auto">
            <Bar data={data} options={options} style={{ 
              width: '100%',
            }}/>
        </div>
    );
};
