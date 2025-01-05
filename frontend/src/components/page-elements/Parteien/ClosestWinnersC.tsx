import {useEffect, useState} from "react";
import {ClosestWinners} from "../../../api/index.ts";
import {useElection} from "../../../context/ElectionContext.tsx";
import ContentTileC from "../../UI-element-components/ContentTileC.tsx";
import './table.css';


export default function ClosestWinnersC({fetchClostestWinners}: {
    fetchClostestWinners: (id: number) => Promise<ClosestWinners>
}) {

    const {selectedElection} = useElection();
    const [closestWinners, setClosestWinners] = useState<ClosestWinners>();

    useEffect(() => {
        const getAbgeordnete = async () => {
            try {
                const data = await fetchClostestWinners(selectedElection?.id ?? 0);
                setClosestWinners(data);
            } catch (error) {
                console.error('Error fetching Abgeordnete:', error);
            }
        };
        getAbgeordnete();
    }, [selectedElection]);

    return (
        <ContentTileC doubleSize={true} header={closestWinners?.closestType === "Winner" ? "Knappste Sieger" : "Knappste Verlierer"}>
            <table className="table">
                <thead>
                <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Vorname</th>
                    <th scope="col">Beruf</th>
                    <th scope="col">Geburtsjahr</th>
                    <th scope="col">Wahlkreisname</th>
                </tr>
                </thead>
                <tbody>
                {closestWinners?.closestWinners?.map((winner) => (
                    <tr key={winner.abgeordneter.id}>
                        <td>{winner.abgeordneter.name}</td>
                        <td>{winner.abgeordneter.firstname}</td>
                        <td title={winner.abgeordneter.profession}>{winner.abgeordneter.profession}</td>
                        <td>{winner.abgeordneter.yearOfBirth}</td>
                        <td>{winner.wahlkreis.name}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </ContentTileC>
    )
}