import {useEffect, useState} from "react";
import {fetchWahlkreise} from "../apiServices.ts";
import {Wahlkreis} from "../api";
import {useElection} from "../context/ElectionContext.tsx";
import Charttile from "./chart-tile.tsx";


export default function Wahlkreisliste({showWahlkreisDetails}: { showWahlkreisDetails: (id: number) => void }) {

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
        <Charttile showfilter={false} header={"Wahlkreise"}>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Wahlkreisname
                    </th>
                    <th scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bundesland
                    </th>
                    <th scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Abgeordneter
                    </th>
                    <th scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stärkste Partei
                    </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {wahlkreise?.map((wahlkreis) => (
                    <tr key={wahlkreis.id} className={"hover:bg-gray-50 hover:cursor-pointer"}
                        onClick={() => showWahlkreisDetails(wahlkreis.id)}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {wahlkreis.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            "Ein Bundesland"
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            "ein Abgeordneter"
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            "eine Partei"
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </Charttile>
    )
}