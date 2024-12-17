import {useEffect, useState} from 'react';
import {fetchSitzveteilung} from '../apiServices';
import {SeatDistribution} from "../api";
import ChartTileC from "./ChartTileC.tsx";
import DoughnutChart from "./DoughnutC.tsx";
import {ChartData} from "chart.js";
import {useElection} from "../context/ElectionContext.tsx";
import {getPartyColor} from "../utils/utils.tsx";

export default function SitzverteilungC() {
    const {selectedElection} = useElection();
    const [sitzverteilung, setSitzverteilung] = useState<SeatDistribution>();

    useEffect(() => {
        const getSitzverteilung = async () => {
            try {
                const data = await fetchSitzveteilung(selectedElection?.id ?? 0);
                console.log("SitzverteilungC: data", data);
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
            <ChartTileC header={"Sitzverteilung"}>
                <DoughnutChart data={data}></DoughnutChart>
                <table className="table">
                    <thead>
                    <tr>
                        <th scope="col">Kürzel</th>
                        <th scope="col">Partei</th>
                        <th scope="col">Sitze</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sitzverteilung?.distribution.map((partei) => (
                        <tr key={partei.party.id}>
                            <td style={{color: getPartyColor(partei.party.shortname)}}>
                                {partei.party.shortname}
                            </td>
                            <td>{partei.party.name}</td>
                            <td>{partei.seats}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>

            </ChartTileC>
        </div>
    )
}