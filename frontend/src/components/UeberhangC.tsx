import {useEffect, useState} from "react";
import {Ueberhang} from "../api";
import {useElection} from "../context/ElectionContext.tsx";
import ChartTileC from "./ChartTileC.tsx";
import './table.css';


export default function UeberhangC({fetchUeberhang}: {
    fetchUeberhang: (id: number) => Promise<Ueberhang>
}) {

    const {selectedElection} = useElection();
    const [ueberhang, setUeberhang] = useState<Ueberhang>();

    useEffect(() => {
        const getUeberhang = async () => {
            try {
                const data = await fetchUeberhang(selectedElection?.id ?? 0);
                const dataSorted = {...data, bundeslaender: data.bundeslaender?.sort((a, b) => a.ueberhang - b.ueberhang)};
                setUeberhang(dataSorted);
            } catch (error) {
                console.error('Error fetching Ueberhaenge:', error);
            }
        };
        getUeberhang();
    }, [selectedElection]);

    return (
        <ChartTileC header="Überhang pro Bundesland">
            <table className="table">
                <thead>
                <tr>
                    <th scope="col">Bundesland</th>
                    <th scope="col">#Überhangsmandate</th>
                </tr>
                </thead>
                <tbody>
                {ueberhang?.bundeslaender?.map((bundeslandData) => (
                    <tr key={bundeslandData.bundesland.id}>
                        <td>{bundeslandData.bundesland.name}</td>
                        <td>{bundeslandData.ueberhang}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </ChartTileC>
    )
}