import {useEffect, useState} from 'react';
import {fetchSitzveteilung} from '../apiServices';
import {SeatDistribution} from "../api";
import Charttile from "./chart-tile.tsx";
import DoughnutChart from "./Doughnut.tsx";
import {ChartData} from "chart.js";
import {useElection} from "../context/ElectionContext.tsx";
import {getPartyColor} from "../utils/utils.tsx";

export default function Sitzverteilung() {
    const {selectedElection} = useElection();
    const [sitzverteilung, setSitzverteilung] = useState<SeatDistribution>();

    useEffect(() => {
        const getSitzverteilung = async () => {
            try {
                const data = await fetchSitzveteilung(selectedElection?.id ?? 0);
                setSitzverteilung(data);
            } catch (error) {
                console.error('Error fetching Sitzverteilung:', error);
            }
        };
        getSitzverteilung();
    }, [selectedElection]);

    let data: ChartData = {
        labels: sitzverteilung?.distribution?.map((partei) => `${partei.party.shortname}: ${partei.seats}`),
        datasets: [{
            data: sitzverteilung?.distribution?.map((partei) => partei.seats),
            backgroundColor: sitzverteilung?.distribution?.map((partei) => getPartyColor(partei.party.shortname)),
            borderWidth: 0,
        },],
    };


    return (
        <div className={"flex-grow"}>
            <Charttile header={"Sitzverteilung"}>
                <DoughnutChart data={data}></DoughnutChart>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kürzel
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Partei
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sitze
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {sitzverteilung?.distribution.map((partei) => (
                        <tr key={partei.party.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                                style={{color: getPartyColor(partei.party.shortname)}}>
                                {partei.party.shortname}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {partei.party.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {partei.seats}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </Charttile>
        </div>
    )
}