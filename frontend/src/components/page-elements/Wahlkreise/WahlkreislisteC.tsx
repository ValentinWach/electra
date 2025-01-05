import {useEffect, useState} from "react";
import {fetchWahlkreise} from "../../../apiServices.ts";
import {Wahlkreis} from "../../../api/index.ts";
import {useElection} from "../../../context/ElectionContext.tsx";
import {GridData} from "../../../models/GridData.ts";
import GridC from "../../UI-element-components/GridC.tsx";
import {ContentTileConfig} from "../../../models/GridData.ts";
import { useMinLoadingTime } from "../../../hooks/useMinLoadingTime.ts";

export default function WahlkreislisteC({showWahlkreisDetails}: { showWahlkreisDetails: (id: number) => void }) {

    const {selectedElection} = useElection();
    const [wahlkreise, setWahlkreise] = useState<Wahlkreis[]>();
    const [wahlkreisGridData, setWahlkreisGridData] = useState<GridData>({columns: [], rows: []});
    const [loading, setLoading] = useState(true);
    const showLoader = useMinLoadingTime(loading);

    useEffect(() => {
        const getWahlkreise = async () => {
            try {
                setLoading(true);
                const data = await fetchWahlkreise();
                setWahlkreise(data);
            } catch (error) {
                console.error('Error fetching Wahlkreise:', error);
            } finally {
                setLoading(false);
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
                    {column_id: 3, value: wahlkreis.bundesland.name},
                ]
            })) ?? []
        );
        setWahlkreisGridData(wahlkreisGridDataNew);
    }, [wahlkreise]);
    return (
        <GridC gridData={wahlkreisGridData} contentTileConfig={new ContentTileConfig("Wahlkreise")} defaultSortColumnId={1} defaultSortDirection="asc" onRowClick={(id) => showWahlkreisDetails(id)} loading={showLoader} />
    )
}