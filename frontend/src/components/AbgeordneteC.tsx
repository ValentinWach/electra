import {useEffect, useState} from "react";
import {Abgeordneter} from "../api";
import {useElection} from "../context/ElectionContext.tsx";
import ChartTileC from "./ChartTileC.tsx";
import './table.css';
import {getPartyColor} from "../utils/utils.tsx";


export default function AbgeordneteC({fetchAbgeordnete}: {
    fetchAbgeordnete: (id: number) => Promise<Abgeordneter[]>
}) {

    const {selectedElection} = useElection();
    const [abgeordnete, setAbgeordnete] = useState<Abgeordneter[]>();

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

    return (
        <ChartTileC header={"Abgeordnete"}>
            <table className="table">
                <thead>
                <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Vorname</th>
                    <th scope="col">Beruf</th>
                    <th scope="col">Geburtsjahr</th>
                    <th scope="col">Partei</th>
                </tr>
                </thead>
                <tbody>
                {abgeordnete?.map((abgeordneter) => (
                    <tr key={abgeordneter.id}>
                        <td>{abgeordneter.name}</td>
                        <td>{abgeordneter.firstname}</td>
                        <td>{abgeordneter.profession}</td>
                        <td>{abgeordneter.yearOfBirth}</td>
                        <td style={{color: abgeordneter.party ? getPartyColor(abgeordneter.party.shortname) : 'black'}}>{abgeordneter.party ? abgeordneter.party.shortname : "Einzelbewerber"}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </ChartTileC>
    )
}