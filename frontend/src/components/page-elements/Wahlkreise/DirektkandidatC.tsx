import {OverviewWahlkreis} from "../../../api";
import GridC from "../../UI-element-components/GridC";
import {getPartyColor} from "../../../utils/GetPartyColor.tsx";
import {ContentTileConfig} from "../../../models/GridData.ts";
import { useMinLoadingTime } from "../../../hooks/useMinLoadingTime.ts";

export default function DirektkandidatC({overview, loading = false}: {overview: OverviewWahlkreis | undefined, loading?: boolean}) {
    const showLoader = useMinLoadingTime(loading);

    return (
        <GridC
            gridData={{
                columns: [
                    {id: 1, label: 'Name', searchable: false},
                    {id: 2, label: 'Vorname', searchable: false},
                    {id: 3, label: 'Geburtsjahr', searchable: false},
                    {id: 4, label: 'Beruf', searchable: false},
                    {id: 5, label: 'Partei', searchable: false}
                ],
                rows: [{
                    key: overview?.direktkandidat?.id ?? 0,
                    values: [
                        {column_id: 1, value: overview?.direktkandidat?.name ?? ''},
                        {column_id: 2, value: overview?.direktkandidat?.firstname ?? ''},
                        {column_id: 3, value: overview?.direktkandidat?.yearOfBirth?.toString() ?? ''},
                        {column_id: 4, value: overview?.direktkandidat?.profession ?? ''},
                        {
                            column_id: 5,
                            value: overview?.direktkandidat?.party?.shortname ?? '',
                            badge: {color: getPartyColor(overview?.direktkandidat?.party?.shortname ?? '', true)}
                        }
                    ]
                }]
            }}
            usePagination={false}
            contentTileConfig={new ContentTileConfig("Direktkandidat", false)}
            loading={showLoader}
        />
    );
}
