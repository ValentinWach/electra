import {useEffect, useState} from 'react';
import {Stimmanteil, Wahl} from "../api";
import ChartTileC from "./ChartTileC.tsx";
import {ChartData} from "chart.js";
import {useElection} from "../context/ElectionContext.tsx";
import {getPartyColor} from "../utils/utils.tsx";
import BarchartC from "./BarchartC.tsx";
import type {DropdownType} from "../models/Chart-Data.ts";

export default function ZweitstimmenanteilC({fetchStimmanteile}: {
    fetchStimmanteile: (wahlId: number) => Promise<Stimmanteil[]>
}) {
    const {elections, selectedElection} = useElection();
    const [stimmanteil, setStimmanteil] = useState<Stimmanteil[]>();
    const [comparedStimmanteil, setComparedStimmanteil] = useState<Stimmanteil[]>()
    const [comparedElection, setComparedElection] = useState<Wahl | null>()

    useEffect(() => {
        const getStimmanteile = async () => {
            try {
                const data = await fetchStimmanteile(selectedElection?.id ?? 0);
                setComparedElection(null);
                setStimmanteil(data);
            } catch (error) {
                console.error('Error fetching Sitzverteilung:', error);
            }
        };
        getStimmanteile();
    }, [selectedElection]); //Use for every chart; always depends on the selected election

    const compareWahlDD: DropdownType = {
        label: "Ergebnis Vergleichen",
        items: [{label: "Nicht vergleichen", id: -1},
            ...elections.filter(e => e.id != selectedElection?.id).map(election => ({
            label: election.date.toLocaleDateString('de-DE', {month: 'long', year: 'numeric'}),
            id: election.id
        }))]
    };

    async function compareStimmanteile(wahlId: number) {
        if (wahlId < 1) {
            setComparedElection(null);
        } else {
            try {
                const comparedData = await fetchStimmanteile(wahlId);
                const comparedMap = new Map(comparedData.map(item => [item.party.id, item.share]));
                const stimmanteilWithDifference = stimmanteil?.map(item => {
                    const comparedShare = comparedMap.get(item.party.id) || 0;
                    const difference = Math.round((comparedShare - item.share)*10)/10;
                    return {
                        ...item,
                        share: difference
                    };
                }) || [];
                setComparedStimmanteil(stimmanteilWithDifference);
                setComparedElection(elections.find(e => e.id === wahlId) ?? elections[0]);

            } catch (error) {
                console.error('Error fetching Sitzverteilung:', error);
            }
        }
    }

    let mainData: ChartData = {
        labels: stimmanteil?.map((partei) => `${partei.party.shortname}: ${partei.share}`),
        datasets: [{
            data: stimmanteil?.map((partei) => partei.share),
            backgroundColor: stimmanteil?.map((partei) => getPartyColor(partei.party.shortname)),
            borderWidth: 0,
        },],
    };

    let comparedData: ChartData = {
        labels: comparedStimmanteil?.map((partei) => `${partei.party.shortname}: ${partei.share}`),
        datasets: [{
            data: comparedStimmanteil?.map((partei) => partei.share),
            backgroundColor: comparedStimmanteil?.map((partei) => getPartyColor(partei.party.shortname)),
            borderWidth: 0,
        },],
    };

    return (
        <div className={"flex-grow"}>
            <ChartTileC dropDownContent={compareWahlDD} dropDownFunction={compareStimmanteile} header={"Zweitstimmenanteile"}>
                {comparedElection ?
                    <BarchartC data={comparedData}></BarchartC>
                    :
                    <BarchartC data={mainData}></BarchartC>}
            </ChartTileC>
        </div>
    )
}