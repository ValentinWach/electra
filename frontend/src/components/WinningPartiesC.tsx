import ChartTileC from "./ChartTileC.tsx";
import type {WinningParties} from "../api";
import {getPartyColor} from "../utils/utils.tsx";
import {useElection} from "../context/ElectionContext.tsx";
import {useEffect, useState} from "react";
import './table.css';

export default function WinningPartiesC({fetchWinningParties}: {
    fetchWinningParties: (wahlId: number) => Promise<WinningParties>
}) {
    const {selectedElection} = useElection();
    const [winningParties, setWinningParties] = useState<WinningParties>()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const winningParties = await fetchWinningParties(selectedElection?.id ?? 0);
                setWinningParties(winningParties);
            } catch (error) {
                console.error('Error fetching winning parties:', error);
            }
        };
        fetchData();
    }, [selectedElection]);

    return (
        <ChartTileC header={"Siegerparteien"}>
            {winningParties && (
                <table className="table">
                    <thead className="bg-gray-50">
                    <tr>
                        <th scope="col">
                        </th>
                        <th scope="col">
                            Kürzel
                        </th>
                        <th scope="col">
                            Parteiname
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr key={winningParties.erststimme[0].party.id}>
                        <td>
                            Erstimmen
                        </td>
                        <td>
                            {winningParties.erststimme[0].party.shortname}
                        </td>
                        <td
                            style={{color: getPartyColor(winningParties.erststimme[0].party.shortname)}}>
                            {winningParties.erststimme[0].party.name}
                        </td>
                    </tr>
                    <tr key={winningParties.zweitstimme[0].party.id}>
                        <td>
                            Zweitstimmen
                        </td>
                        <td>
                            {winningParties.zweitstimme[0].party.shortname}
                        </td>
                        <td
                            style={{color: getPartyColor(winningParties.zweitstimme[0].party.shortname)}}>
                            {winningParties.zweitstimme[0].party.name}
                        </td>
                    </tr>
                    </tbody>
                </table>
            )}
        </ChartTileC>
    );
}