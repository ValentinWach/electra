import {useEffect, useState} from 'react';
import {Stimmanteil, Wahl} from "../../../api/index.ts";
import ContentTileC from "../../UI-element-components/ContentTileC.tsx";
import {ChartData} from "chart.js";
import {useElection} from "../../../context/ElectionContext.tsx";
import {getPartyColor} from "../../../utils/utils.tsx";
import BarchartC from "../../chart-components/BarchartC.tsx";
import type {DropdownType} from "../../../models/DropDownData.ts";

export default function ZweitstimmenanteilC({fetchStimmanteile, showAbsoluteVotes}: {
    fetchStimmanteile: (wahlId: number) => Promise<Stimmanteil[]>, showAbsoluteVotes?: boolean | null
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
    }, [selectedElection, fetchStimmanteile]); //Use for every chart; always depends on the selected election

    const compareWahlDD: DropdownType = {
        items: [{label: "Nicht vergleichen", id: -1},
            ...elections.filter(e => e.id != selectedElection?.id).map(election => ({
                label: election.date.toLocaleDateString('de-DE', {month: 'long', year: 'numeric'}),
                id: election.id
            }))],
        defaultChosen: -1
    };

    async function compareStimmanteile(wahlId: number) {
        if (wahlId < 1) {
            setComparedElection(null);
        } else {
            try {
                const comparedData = await fetchStimmanteile(wahlId);
                const comparedMap = new Map(comparedData.map(item => [item.party.id, item]));
                const stimmanteilWithDifference = stimmanteil?.map(item => {
                    const comparedItem = comparedMap.get(item.party.id) || {share: 0, absolute: 0};
                    const shareDifference = Math.round((comparedItem.share - item.share) * 10) / 10;
                    const absoluteDifference = comparedItem.absolute - item.absolute;
                    return {
                        ...item,
                        share: shareDifference,
                        absolute: absoluteDifference
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
        labels: stimmanteil?.map((partei) => `${partei.party.shortname}: ${partei.share}%`),
        datasets: [{
            data: stimmanteil?.map((partei) => partei.share),
            backgroundColor: stimmanteil?.map((partei) => getPartyColor(partei.party.shortname)),
            borderWidth: 0,
        },],
    };

    let comparedData: ChartData = {
        labels: comparedStimmanteil?.map((partei) => `${partei.party.shortname}: ${partei.share > 0 ? '+' : ''}${partei.share}%`),
        datasets: [{
            data: comparedStimmanteil?.map((partei) => partei.share),
            backgroundColor: comparedStimmanteil?.map((partei) => getPartyColor(partei.party.shortname)),
            borderWidth: 0,
        },],
    };

    return (
        <div className={"flex-grow"}>
            <ContentTileC dropDownContent={compareWahlDD} dropDownFunction={compareStimmanteile} header={"Zweitstimmenanteile"}>
                {comparedElection ?
                    <BarchartC data={comparedData}></BarchartC>
                    :
                    <BarchartC data={mainData}></BarchartC>}
                {showAbsoluteVotes ?
                    <table className="table mt-10">
                        <thead>
                        <tr>
                            <th scope="col">Kürzel</th>
                            <th scope="col">Partei</th>
                            <th scope="col">{comparedElection ? "Differenz zum Vergleichszeitraum" : "Anzahl Zweitstimmen"}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {stimmanteil?.map((partei) => (
                            <tr key={partei.party.id}>
                                <td style={{color: getPartyColor(partei.party.shortname)}}>
                                    {partei.party.shortname}
                                </td>
                                <td>{partei.party.name}</td>
                                {!comparedElection && <td>{partei.absolute}</td> }
                                {comparedElection && <td>{comparedStimmanteil?.find(p => p.party.id === partei.party.id)?.absolute > 0 ? '+' : ''}{comparedStimmanteil?.find(p => p.party.id === partei.party.id)?.absolute}</td>}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    :
                    null
                }
            </ContentTileC>
        </div>
    )
}