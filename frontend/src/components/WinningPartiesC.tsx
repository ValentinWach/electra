import ChartTileC from "./ChartTileC.tsx";
import type {WinningParties} from "../api";
import {getPartyColor} from "../utils/utils.tsx";
import {useElection} from "../context/ElectionContext.tsx";
import {useEffect, useState} from "react";

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
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kürzel
                        </th>
                        <th scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Parteiname
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    <tr key={winningParties.erststimmen.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">
                            Erstimmen
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {winningParties.erststimmen.shortname}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                            style={{color: getPartyColor(winningParties.erststimmen.shortname)}}>
                            {winningParties.erststimmen.name}
                        </td>
                    </tr>
                    <tr key={winningParties.zweitstimmen.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">
                            Zweitstimmen
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {winningParties.zweitstimmen.shortname}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"
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