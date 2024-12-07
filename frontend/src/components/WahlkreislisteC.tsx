import {useEffect, useState} from "react";
import {fetchWahlkreise} from "../apiServices.ts";
import {Wahlkreis} from "../api";
import {useElection} from "../context/ElectionContext.tsx";
import ChartTileC from "./ChartTileC.tsx";
import './table.css';


export default function WahlkreislisteC({showWahlkreisDetails}: { showWahlkreisDetails: (id: number) => void }) {

    const {selectedElection} = useElection();
    const [wahlkreise, setWahlkreise] = useState<Wahlkreis[]>();
    useEffect(() => {
        const getSitzverteilung = async () => {
            try {
                const data = await fetchWahlkreise();
                setWahlkreise(data);
            } catch (error) {
                console.error('Error fetching Wahlkreise:', error);
            }
        };
        getSitzverteilung();
    }, [selectedElection]);

    return (
        <ChartTileC header={"Wahlkreise"}>
            <table className="table">
                <thead>
                <tr>
                    <th scope="col">Wahlkreisname</th>
                    <th scope="col">Bundesland</th>
                    <th scope="col">Abgeordneter</th>
                    <th scope="col">Stärkste Partei</th>
                </tr>
                </thead>
                <tbody>
                {wahlkreise?.map((wahlkreis) => (
                    <tr key={wahlkreis.id} className={"hover:cursor-pointer"} onClick={() => showWahlkreisDetails(wahlkreis.id)}>
                        <td>{wahlkreis.name}</td>
                        <td>Ein Bundesland</td>
                        <td>ein Abgeordneter</td>
                        <td>eine Partei</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </ChartTileC>
    )
}