import { useEffect, useState } from "react";
import GridC from "../../UI-element-components/GridC.tsx"
import { Partei } from "../../../api/index.ts";
import { useElection } from "../../../context/ElectionContext.tsx";
import { fetchParteien } from "../../../apiServices.ts";
import {ContentTileConfig} from "../../../models/GridData.ts";
import { useMinLoadingTime } from "../../../hooks/useMinLoadingTime.ts";
import { getPartyColor } from "../../../utils/GetPartyColor.tsx";
export default function AngetreteneParteienC({showParteiDetails}: {showParteiDetails: (id: number) => void}) {
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
                {id: 1, label: 'Kurzname', searchable: true},
                {id: 2, label: 'Name', searchable: true}
            ],
            rows: alleParteien?.map(partei => ({
                key: partei.id,
                values: [
                    {column_id: 1, value: partei.shortname ?? '', badge: {color: getPartyColor(partei.shortname ?? '', false)}},
                    {column_id: 2, value: partei.name ?? ''}
                ]
            })) ?? []
        }}
        contentTileConfig={new ContentTileConfig("Angetretene Parteien")}
        defaultSortColumnId={1}
        defaultSortDirection="asc"
        onRowClick={(id) => showParteiDetails(id)}
    />
    )
}