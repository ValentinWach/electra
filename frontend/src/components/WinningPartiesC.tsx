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
                    <tr key={winningParties.erststimmen.id}>
                        <td>
                            Erstimmen
                        </td>
                        <td>
                            {winningParties.erststimmen.shortname}
                        </td>
                        <td
                            style={{color: getPartyColor(winningParties.erststimmen.shortname)}}>
                            {winningParties.erststimmen.name}
                        </td>
                    </tr>
                    <tr key={winningParties.zweitstimmen.id}>
                        <td>
                            Zweitstimmen
                        </td>
                        <td>
                            {winningParties.zweitstimmen.shortname}
                        </td>
                        <td
                            style={{color: getPartyColor(winningParties.zweitstimmen.shortname)}}>
                            {winningParties.zweitstimmen.name}
                        </td>
                    </tr>
                    </tbody>
                </table>
            )}
        </ChartTileC>
    );
}