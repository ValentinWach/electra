import {useEffect, useState} from "react";
import {Abgeordneter} from "../../../api/index.ts";
import {useElection} from "../../../context/ElectionContext.tsx";
import GridC from "../../UI-element-components/GridC.tsx";
import {GridData, ContentTileConfig} from "../../../models/GridData.ts";
import { useMinLoadingTime } from '../../../hooks/useMinLoadingTime.ts';
import { getPartyColor } from "../../../utils/utils.tsx";

export default function AbgeordneteC({fetchAbgeordnete}: {
    fetchAbgeordnete: (id: number) => Promise<Abgeordneter[]>
}) {

    const {selectedElection} = useElection();
    const [abgeordnete, setAbgeordnete] = useState<Abgeordneter[]>();
    const [abgeordneteGridData, setAbgeordneteGridData] = useState<GridData>({columns: [], rows: []});
    const [loading, setLoading] = useState(true);
    const showLoader = useMinLoadingTime(loading);

    useEffect(() => {
        const getAbgeordnete = async () => {
            try {
                setLoading(true);
                const data = await fetchAbgeordnete(selectedElection?.id ?? 0);
                setAbgeordnete(data);
            } catch (error) {
                console.error('Error fetching Abgeordnete:', error);
            } finally {
                setLoading(false);
            }
        };
        getAbgeordnete();
    }, [selectedElection]);

    useEffect(() => {
        const abgeordneteGridDataNew = new GridData(
            [
                {id: 1, label: 'Name', searchable: true},
                {id: 2, label: 'Vorname', searchable: true},
                {id: 3, label: 'Beruf', searchable: true},
                {id: 4, label: 'Geburtsjahr', searchable: true},
                {id: 5, label: 'Partei', searchable: true}
            ],
            abgeordnete?.map((abgeordneter) => ({
                key: abgeordneter.id,
                values: [
                    {column_id: 1, value: abgeordneter.name},
                    {column_id: 2, value: abgeordneter.firstname},
                    {column_id: 3, value: abgeordneter.profession ?? ''},
                    {column_id: 4, value: abgeordneter.yearOfBirth ? abgeordneter.yearOfBirth.toString() : ''},
                    {column_id: 5, value: abgeordneter.party ? abgeordneter.party.shortname : "Einzelbewerber", badge: {text: abgeordneter.party?.shortname ?? '', color: getPartyColor(abgeordneter.party?.shortname ?? '', false)}}
                ]
            })) ?? []
        );
        setAbgeordneteGridData(abgeordneteGridDataNew);
    }, [abgeordnete]);

    return (
        <GridC gridData={abgeordneteGridData} contentTileConfig={new ContentTileConfig("Abgeordnete")} defaultSortColumnId={1} defaultSortDirection="asc" pageSize={15} loading={showLoader} />
    )
}