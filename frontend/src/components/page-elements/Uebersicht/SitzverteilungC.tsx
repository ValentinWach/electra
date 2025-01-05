import {useEffect, useState} from 'react';
import {fetchSitzveteilung} from '../../../apiServices.ts';
import {SeatDistribution} from "../../../api/index.ts";
import ContentTileC from "../../UI-element-components/ContentTileC.tsx";
import DoughnutChart from "../../chart-components/DoughnutChartC.tsx";
import {ChartData} from "chart.js";
import {useElection} from "../../../context/ElectionContext.tsx";
import {getPartyColor} from "../../../utils/utils.tsx";
import { useMinLoadingTime } from '../../../hooks/useMinLoadingTime.ts';

export default function SitzverteilungC() {
    const {selectedElection} = useElection();
    const [sitzverteilung, setSitzverteilung] = useState<SeatDistribution>();
    const [loading, setLoading] = useState(true);
    const showLoader = useMinLoadingTime(loading);

    useEffect(() => {
        const getSitzverteilung = async () => {
            try {
                setLoading(true);
                const data = await fetchSitzveteilung(selectedElection?.id ?? 0);
                setSitzverteilung(data);
            } catch (error) {
                console.error('Error fetching Sitzverteilung:', error);
            } finally {
                setLoading(false);
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
            <ContentTileC loading={showLoader} header={"Sitzverteilung"}>
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

            </ContentTileC>
        </div>
    )
}