import {useEffect, useState} from "react";
import {Ueberhang} from "../../../api/index.ts";
import {useElection} from "../../../context/ElectionContext.tsx";
import GridC from "../../UI-element-components/GridC.tsx";
import {GridData, ContentTileConfig} from "../../../models/GridData.ts";
import { useMinLoadingTime } from "../../../hooks/useMinLoadingTime.ts";

export default function UeberhangC({fetchUeberhang}: {
    fetchUeberhang: (id: number) => Promise<Ueberhang>
}) {

    const {selectedElection} = useElection();
    const [ueberhang, setUeberhang] = useState<Ueberhang>();
    const [loading, setLoading] = useState(true);
    const showLoader = useMinLoadingTime(loading);


    useEffect(() => {
        const getUeberhang = async () => {
            try {
                setLoading(true);
                const data = await fetchUeberhang(selectedElection?.id ?? 0)
                const dataSorted = {...data, bundeslaender: data.bundeslaender?.filter(b => b.ueberhang > 0).sort((a, b) => a.ueberhang - b.ueberhang)};
                setUeberhang(dataSorted);
            } catch (error) {
                console.error('Error fetching Ueberhaenge:', error);
            } finally {
                setLoading(false);
            }
        };
        getUeberhang();
    }, [selectedElection]);

    return (
        ueberhang?.bundeslaender?.length != null && ueberhang?.bundeslaender?.length > 0  && (
            <GridC
                loading={showLoader}
                gridData={{
                    columns: [
                        {id: 1, label: 'Bundesland', searchable: false},
                        {id: 2, label: '#Überhangsmandate', searchable: false}
                    ],
                    rows: ueberhang?.bundeslaender?.map(bundeslandData => ({
                        key: bundeslandData.bundesland.id,
                        values: [
                            {column_id: 1, value: bundeslandData.bundesland.name},
                            {column_id: 2, value: bundeslandData.ueberhang.toString()}
                        ]
                    })) ?? []
                }}
                contentTileConfig={new ContentTileConfig("Überhänge")}
                usePagination={false}
                defaultSortColumnId={2}
                defaultSortDirection="desc"
            />
        )
    )
}