import {useEffect, useState} from "react";
import {
    fetchStimmanteileWahlkreis,
    fetchWahlkreise,
    fetchWinningPartiesWahlkreis,
    fetchWahlkreisOverview
} from "../apiServices.ts";
import {OverviewWahlkreis, Stimmanteil, Wahlkreis} from "../api";
import {useElection} from "../context/ElectionContext.tsx";
import WahlkreislisteC from "../components/WahlkreislisteC.tsx";
import ZweitstimmenanteilC from "../components/ZweitstimmenanteilC.tsx";
import WinningPartiesC from "../components/WinningPartiesC.tsx";
import type {WinningParties} from "../api.ts";
import {getPartyColor} from "../utils/utils.tsx";
import ChartTileC from "../components/ChartTileC.tsx";
import DoughnutChart from "../components/DoughnutC.tsx";
import {ChartData} from "chart.js";
import WahlkreisMapC from "../components/WahlkreisMapC.tsx";

export default function Wahlkreise() {

    const {selectedElection} = useElection();
    const [wahlkreise, setWahlkreise] = useState<Wahlkreis[]>();
    const [selectedWahlkreis, setSelectedWahlkreis] = useState<Wahlkreis | null>(null);
    const [overview, setOverview] = useState<OverviewWahlkreis>();


    useEffect(() => {
        const getWahlkreise = async () => {
            try {
                const data = await fetchWahlkreise();
                setWahlkreise(data);
            } catch (error) {
                console.error('Error fetching Wahlkreise:', error);
            }
        };
        getWahlkreise();
    }, [selectedElection]);

    useEffect(() => {
        const getOverview = async () => {
            try {
                const data = await fetchWahlkreisOverview(selectedElection?.id ?? 0, selectedWahlkreis?.id ?? 0);
                setOverview(data);
            } catch (error) {
                console.error('Error fetching Wahlkreis Overview:', error);
            }
        }
        getOverview()
    }, [selectedElection, selectedWahlkreis]);
    const nichtWaehler = Math.round((100 - overview?.wahlbeteiligung) * 10) / 10;
    let wahlbeteiligungData: ChartData = {
        labels: [`Wähler: ${overview?.wahlbeteiligung}%`, `Nichtwähler: ${nichtWaehler}%`],
        datasets: [{
            data: [overview?.wahlbeteiligung, nichtWaehler],
            backgroundColor: ['#008000', '#d3d3d3'],
            borderWidth: 0,
        },],
    };

    const showWahlkreisDetails = (id: number) => {
        setSelectedWahlkreis(wahlkreise?.find(wahlkreis => wahlkreis.id === id) ?? null);
    }

    async function wrapFetchStimmanteileWahlkreis(wahlId: number): Promise<Stimmanteil[]> {
        return fetchStimmanteileWahlkreis(wahlId, selectedWahlkreis?.id ?? 0);
    }

    async function wrapFetchWinningPartiesWahlkreis(wahlId: number): Promise<WinningParties> {
        return fetchWinningPartiesWahlkreis(wahlId, selectedWahlkreis?.id ?? 0);
    }

    return (
        <div className={"flex flex-col items-center"}>
            {
                selectedWahlkreis ?
                    <div className="w-chart-lg max-lg:w-char flex justify-start">
                        <button
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                            onClick={() => setSelectedWahlkreis(null)}> zurück
                        </button>
                    </div>
                    :
                    <>
                        <WahlkreislisteC showWahlkreisDetails={showWahlkreisDetails}/>
                        <WahlkreisMapC></WahlkreisMapC>
                    </>
            }
            {
                selectedWahlkreis ?
                    <>
                        <WinningPartiesC fetchWinningParties={wrapFetchWinningPartiesWahlkreis}/>
                        <ZweitstimmenanteilC fetchStimmanteile={wrapFetchStimmanteileWahlkreis}
                                             showAbsoluteVotes={true}/>
                        <ChartTileC header={"Direktkandidat"}>
                            <table className="table">
                                <thead>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">Vorname</th>
                                    <th scope="col">Geburtsjahr</th>
                                    <th scope="col">Beruf</th>
                                    <th scope="col">Partei</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr key={overview?.direktkandidat?.id}>
                                    <td>{overview?.direktkandidat?.name}</td>
                                    <td>{overview?.direktkandidat?.firstname}</td>
                                    <td>{overview?.direktkandidat?.yearOfBirth}</td>
                                    <td>{overview?.direktkandidat?.profession}</td>
                                    <td style={{color: getPartyColor(overview?.direktkandidat.party.shortname)}}>
                                        {overview?.direktkandidat.party.shortname}
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </ChartTileC>
                        <ChartTileC header={"Wahlbeteiligung"}>
                            <DoughnutChart data={wahlbeteiligungData} fullCircle={true}></DoughnutChart>
                        </ChartTileC>
                    </>
                    :
                    null
            }
        </div>
    )
}