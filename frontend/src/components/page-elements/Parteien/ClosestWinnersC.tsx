import {useEffect, useState} from "react";
import {ClosestWinners} from "../../../api/index.ts";
import {useElection} from "../../../context/ElectionContext.tsx";
import GridC from "../../UI-element-components/GridC.tsx";
import {GridData, ContentTileConfig} from "../../../models/GridData.ts";
import { useMinLoadingTime } from "../../../hooks/useMinLoadingTime.ts";

export default function ClosestWinnersC({fetchClostestWinners}: {
    fetchClostestWinners: (id: number) => Promise<ClosestWinners>
}) {

    const {selectedElection} = useElection();
    const [closestWinners, setClosestWinners] = useState<ClosestWinners>();
    const [loading, setLoading] = useState(true);
    const showLoader = useMinLoadingTime(loading);

    useEffect(() => {
        const getAbgeordnete = async () => {
            try {
                setLoading(true);
                const data = await fetchClostestWinners(selectedElection?.id ?? 0);
                setClosestWinners(data);
            } catch (error) {
                console.error('Error fetching Abgeordnete:', error);
            } finally {
                setLoading(false);
            }
        };
        getAbgeordnete();
    }, [selectedElection]);

    return (
        <GridC
            loading={showLoader}
            gridData={{
                columns: [
                    {id: 1, label: 'Name', searchable: false},
                    {id: 2, label: 'Vorname', searchable: false},
                    {id: 3, label: 'Beruf', searchable: false},
                    {id: 4, label: 'Geburtsjahr', searchable: false},
                    {id: 5, label: 'Wahlkreisname', searchable: false}
                ],
                rows: closestWinners?.closestWinners?.map(winner => ({
                    key: winner.abgeordneter.id,
                    values: [
                        {column_id: 1, value: winner.abgeordneter.name},
                        {column_id: 2, value: winner.abgeordneter.firstname},
                        {column_id: 3, value: winner.abgeordneter.profession ?? ''},
                        {column_id: 4, value: winner.abgeordneter.yearOfBirth?.toString() ?? ''},
                        {column_id: 5, value: winner.wahlkreis.name}
                    ]
                })) ?? []
            }}
            contentTileConfig={new ContentTileConfig(
                closestWinners?.closestType === "Winner" ? "Knappste Sieger" : "Knappste Verlierer",
                true
            )}
            usePagination={false}
        />
    )
}