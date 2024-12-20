import {useEffect, useState} from "react";
import {fetchWahlkreise} from "../apiServices.ts";
import {Wahlkreis} from "../api";
import {useElection} from "../context/ElectionContext.tsx";
import './table.css';
import {GridData} from "../models/GridData.ts";
import GridC from "./GridC.tsx";


export default function WahlkreislisteC({showWahlkreisDetails}: { showWahlkreisDetails: (id: number) => void }) {

    const {selectedElection} = useElection();
    const [wahlkreise, setWahlkreise] = useState<Wahlkreis[]>();
    const [wahlkreisGridData, setWahlkreisGridData] = useState<GridData>({columns: [], rows: []});

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
        const wahlkreisGridDataNew = new GridData(
            [
                {id: 1, label: 'Wahlkreisnummer', searchable: true},
                {id: 2, label: 'Wahlkreisname', searchable: true},
                {id: 3, label: 'Bundesland', searchable: true},
            ],
            wahlkreise?.map((wahlkreis) => ({
                key: wahlkreis.id,
                values: [
                    {column_id: 1, value: wahlkreis.id.toString()},
                    {column_id: 2, value: wahlkreis.name},
                    {column_id: 3, value: "Bundesland_Platzhalter"},
                ]
            })) ?? []
        );
        setWahlkreisGridData(wahlkreisGridDataNew);
    }, [wahlkreise]);
    return (
        <GridC gridData={wahlkreisGridData} header={"Wahlkreise"} usePagination={true} pageSize={10} onRowClick={(id) => showWahlkreisDetails(id)} />
    )
}