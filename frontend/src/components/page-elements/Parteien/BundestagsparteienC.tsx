import { useBundestagsParteien } from "../../../hooks/useBundestagsParteien"
import GridC from "../../UI-element-components/GridC.tsx"
import {ContentTileConfig} from "../../../models/GridData.ts";
import { useMinLoadingTime } from "../../../hooks/useMinLoadingTime.ts";
import { getPartyColor } from "../../../utils/GetPartyColor.tsx";

export default function BundestagsparteienC({showParteiDetails}: {showParteiDetails: (rowId: number) => void}) {
    const {parteien, isLoading} = useBundestagsParteien()
    const showLoader = useMinLoadingTime(isLoading);
    return (
        <GridC
        loading={showLoader}
        gridData={{
            columns: [
                {id: 1, label: 'Kurzname', searchable: false},
                {id: 2, label: 'Name', searchable: false}
            ],
            rows: parteien?.map(partei => ({
                key: partei.id,
                values: [
                    {column_id: 1, value: partei.shortname ?? '', badge: {color: getPartyColor(partei.shortname, false)}},
                    {column_id: 2, value: partei.name ?? ''}
                ]
            })) ?? []
        }}
        contentTileConfig={new ContentTileConfig("Bundestagsparteien")}
        usePagination={false}
        defaultSortColumnId={1}
        defaultSortDirection="asc"
        onRowClick={(id) => showParteiDetails(id)}
    />
    )
}