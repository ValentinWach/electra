import {useEffect, useState} from 'react';
import {Stimmanteil} from "../api";
import Charttile from "./chart-tile.tsx";
import {ChartData} from "chart.js";
import {useElection} from "../context/ElectionContext.tsx";
import {getPartyColor} from "../utils/utils.tsx";
import Barchart from "./Barchart.tsx";

export default function Zweitstimmenanteil({fetchStimmanteile}: { fetchStimmanteile: () => Promise<Stimmanteil[]> }) {
    const {selectedElection} = useElection();
    const [stimmanteil, setStimmanteil] = useState<Stimmanteil[]>();

    useEffect(() => {
        const getStimmanteile = async () => {
            try {
                const data = await fetchStimmanteile();
                setStimmanteil(data);
            } catch (error) {
                console.error('Error fetching Sitzverteilung:', error);
            }
        };
        getStimmanteile();
    }, [selectedElection]); //Use for every chart; always depends on the selected election

    console.log(stimmanteil);
    let data: ChartData = {
        labels: stimmanteil?.map((partei) => `${partei.party.shortname}: ${partei.share}`),
        datasets: [{
            data: stimmanteil?.map((partei) => partei.share),
            backgroundColor: stimmanteil?.map((partei) => getPartyColor(partei.party.shortname)),
            borderWidth: 0,
        },],
    };

    return (
        <div className={"flex-grow"}>
            <Charttile showfilter={true} header={"Zweitstimmenanteile"}>
                <Barchart data={data}></Barchart>
            </Charttile>
        </div>
    )
}