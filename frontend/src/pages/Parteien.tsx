import {useEffect, useState} from "react";
import {fetchClosestWinners, fetchParteien} from "../apiServices.ts";
import {ClosestWinners, Partei} from "../api";
import {useElection} from "../context/ElectionContext.tsx";
import ChartTileC from "../components/ChartTileC.tsx";
import {getPartyColor} from "../utils/utils.tsx";
import ClosestWinnersC from "../components/ClosestWinnersC.tsx";
import GridC from "../components/GridC.tsx";

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
                    <GridC
                        gridData={{
                            columns: [
                                {id: 1, label: 'Name', searchable: true},
                                {id: 2, label: 'Kurzname', searchable: true}
                            ],
                            rows: parteien?.map(partei => ({
                                key: partei.id,
                                values: [
                                    {column_id: 1, value: partei.name},
                                    {column_id: 2, value: partei.shortname}
                                ]
                            })) ?? []
                        }}
                        header={"Parteien"}
                        usePagination={true}
                        pageSize={10}
                        onRowClick={(id) => showParteiDetails(id)}
                    />
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