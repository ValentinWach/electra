import { useEffect, useState } from "react";
import GridC from "../../UI-element-components/GridC.tsx"
import { Partei } from "../../../api/index.ts";
import { useElection } from "../../../context/ElectionContext.tsx";
import { fetchParteien } from "../../../apiServices.ts";
import {GridData, ContentTileConfig} from "../../../models/GridData.ts";
import { useMinLoadingTime } from "../../../hooks/useMinLoadingTime.ts";
export default function AngetreteneParteienC() {
    const [alleParteien, setAlleParteien] = useState<Partei[]>();
    const {selectedElection} = useElection();
    const [loading, setLoading] = useState(true);
    const showLoader = useMinLoadingTime(loading);

    useEffect(() => {
        const getAlleParteien = async () => {
            try {
                setLoading(true);
                const data = await fetchParteien(selectedElection?.id ?? 0);
                setAlleParteien(data);
            } catch (error) {
                console.error('Error fetching Parteien:', error);
            } finally {
                setLoading(false);
            }
        };
        getAlleParteien();
    }, [selectedElection]);


    return (
        <GridC
        loading={showLoader}
        gridData={{
            columns: [
                {id: 1, label: 'Name', searchable: true},
                {id: 2, label: 'Kurzname', searchable: true}
            ],
            rows: alleParteien?.map(partei => ({
                key: partei.id,
                values: [
                    {column_id: 1, value: partei.name},
                    {column_id: 2, value: partei.shortname}
                ]
            })) ?? []
        }}
        contentTileConfig={new ContentTileConfig("Angetretene Parteien")}
    />
    )
}