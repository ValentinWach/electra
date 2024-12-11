import {useEffect, useState} from "react";
import {fetchClosestWinners, fetchParteien} from "../apiServices.ts";
import {ClosestWinners, Partei} from "../api";
import {useElection} from "../context/ElectionContext.tsx";
import ChartTileC from "../components/ChartTileC.tsx";
import {getPartyColor} from "../utils/utils.tsx";
import ClosestWinnersC from "../components/ClosestWinnersC.tsx";

export default function Parteien() {

    const {selectedElection} = useElection();
    const [parteien, setParteien] = useState<Partei[]>();
    const [selectedPartei, setSelectedPartei] = useState<Partei | null>(null);

    useEffect(() => {
        const getParteien = async () => {
            try {
                const data = await fetchParteien(selectedElection?.id ?? 0);
                setParteien(data);
            } catch (error) {
                console.error('Error fetching Parteien:', error);
            }
        };
        getParteien();
    }, [selectedElection]);

    const showParteiDetails = (id: number) => {
        setSelectedPartei(parteien?.find(partei => partei.id === id) ?? null);
    }

    async function fetchClosestWinnersWrapper(wahlId: number): Promise<ClosestWinners> {
        console.log("fetchClosestWinnersWrapper", wahlId, selectedPartei?.id);
        return fetchClosestWinners(wahlId, selectedPartei?.id ?? 0);
    }

    return (
        <div className={"flex flex-col items-center"}>
            {
                selectedPartei ?
                    <div className="w-chart-lg max-lg:w-char flex justify-start">
                        <button
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                            onClick={() => setSelectedPartei(null)}> zurück
                        </button>
                    </div>
                    :
                    <ChartTileC header={"Parteien"}>
                        <table className="table">
                            <thead>
                            <tr>
                                <th scope="col">Name</th>
                                <th scope="col">Kurzname</th>
                            </tr>
                            </thead>
                            <tbody>
                            {parteien?.map((partei) => (
                                <tr key={partei.id} onClick={() => showParteiDetails(partei.id)}>
                                    <td>{partei.name}</td>
                                    <td style={{color: getPartyColor(partei.shortname)}}>{partei.shortname}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </ChartTileC>
            }
            {
                selectedPartei ?
                    <ClosestWinnersC fetchClostestWinners={fetchClosestWinnersWrapper}/>
                    :
                    null
            }
        </div>
    )
}