import { useBundestagsParteien } from "../../../hooks/useBundestagsParteien"
import GridC from "../../UI-element-components/GridC.tsx"
import {GridData, ContentTileConfig} from "../../../models/GridData.ts";

export default function BundestagsparteienC({showParteiDetails}: {showParteiDetails: (rowId: number) => void}) {
    const {parteien} = useBundestagsParteien()
    return (
        <GridC
        gridData={{
            columns: [
                {id: 1, label: 'Name', searchable: false},
                {id: 2, label: 'Kurzname', searchable: false}
            ],
            rows: parteien?.map(partei => ({
                key: partei.id,
                values: [
                    {column_id: 1, value: partei.name ?? ''},
                    {column_id: 2, value: partei.shortname ?? ''}
                ]
            })) ?? []
        }}
        contentTileConfig={new ContentTileConfig("Bundestagsparteien")}
        usePagination={false}
        onRowClick={(id) => showParteiDetails(id)}
    />
    )
}