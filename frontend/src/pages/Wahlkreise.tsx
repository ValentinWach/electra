import {useEffect, useState} from "react";
import {fetchStimmanteileWahlkreis, fetchWahlkreise, fetchWinningPartiesWahlkreis} from "../apiServices.ts";
import {Stimmanteil, Wahlkreis} from "../api";
import {useElection} from "../context/ElectionContext.tsx";
import WahlkreislisteC from "../components/WahlkreislisteC.tsx";
import ZweitstimmenanteilC from "../components/ZweitstimmenanteilC.tsx";
import WinningPartiesC from "../components/WinningPartiesC.tsx";
import type {WinningParties} from "../api.ts";

export default function Wahlkreise() {

    const {selectedElection} = useElection();
    const [wahlkreise, setWahlkreise] = useState<Wahlkreis[]>();
    const [selectedWahlkreis, setSelectedWahlkreis] = useState<Wahlkreis | null>(null);


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
                    <WahlkreislisteC showWahlkreisDetails={showWahlkreisDetails}/>
            }
            {
                selectedWahlkreis ?
                    <>
                        <WinningPartiesC fetchWinningParties={wrapFetchWinningPartiesWahlkreis}/>
                        <ZweitstimmenanteilC fetchStimmanteile={wrapFetchStimmanteileWahlkreis}/>
                    </>
                    :
                    null
            }
        </div>
    )
}