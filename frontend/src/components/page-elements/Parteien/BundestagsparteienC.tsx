import { useBundestagsParteien } from "../../../hooks/useBundestagsParteien"
import GridC from "../../UI-element-components/GridC.tsx"

export default function BundestagsparteienC({showParteiDetails}: {showParteiDetails: (rowId: number) => void}) {
    const parteien = useBundestagsParteien()
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
        header={"Bundestagsparteien"}
        usePagination={false}
        doubleSize={true}
        onRowClick={(id) => showParteiDetails(id)}
        pageSize={10}
    />
    )
}