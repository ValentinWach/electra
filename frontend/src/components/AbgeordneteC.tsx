import {useEffect, useState} from "react";
import {Abgeordneter} from "../api";
import {useElection} from "../context/ElectionContext.tsx";
import './table.css';
import GridC from "./GridC.tsx";
import {GridData} from "../models/GridData.ts";


export default function AbgeordneteC({fetchAbgeordnete}: {
    fetchAbgeordnete: (id: number) => Promise<Abgeordneter[]>
}) {

    const {selectedElection} = useElection();
    const [abgeordnete, setAbgeordnete] = useState<Abgeordneter[]>();
    const [abgeordneteGridData, setAbgeordneteGridData] = useState<GridData>({columns: [], rows: []});

    useEffect(() => {
        const getAbgeordnete = async () => {
            try {
                const data = await fetchAbgeordnete(selectedElection?.id ?? 0);
                setAbgeordnete(data);
            } catch (error) {
                console.error('Error fetching Abgeordnete:', error);
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
                    {column_id: 5, value: abgeordneter.party ? abgeordneter.party.shortname : "Einzelbewerber"}
                ]
            })) ?? []
        );
        setAbgeordneteGridData(abgeordneteGridDataNew);
    }, [abgeordnete]);

    return (
        <GridC gridData={abgeordneteGridData} header={"Abgeordnete"} usePagination={true} pageSize={5} />
    )
}