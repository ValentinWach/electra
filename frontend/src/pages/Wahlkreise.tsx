import {useEffect, useState} from "react";
import {fetchStimmanteileWahlkreis, fetchWahlkreise} from "../apiServices.ts";
import {Stimmanteil, Wahlkreis} from "../api";
import {useElection} from "../context/ElectionContext.tsx";
import Wahlkreisliste from "../components/Wahlkreisliste.tsx";
import Zweitstimmenanteil from "../components/Zweitstimmenanteil.tsx";

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

    return (
        <div className={"flex flex-col items-center"}>
            {
                selectedWahlkreis ?
                    <div className="w-full flex justify-start">
                        <button
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                            onClick={() => setSelectedWahlkreis(null)}> zurück
                        </button>
                    </div>
                    :
                    selectedWahlkreis ? null : <Wahlkreisliste showWahlkreisDetails={showWahlkreisDetails}/>
            }
            {
                selectedWahlkreis ?
                    <Zweitstimmenanteil fetchStimmanteile={wrapFetchStimmanteileWahlkreis}/>
                    :
                    null
            }
        </div>
    )
}