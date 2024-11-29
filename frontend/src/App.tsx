import {useEffect, useState} from 'react';
import {fetchWahlen, fetchSitzveteilung} from './apiServices';
import {SeatDistribution, Wahl} from "./api";
import Sidebar from './Sidebar';

function App() {
    const [wahlen, setWahlen] = useState<Wahl[]>([]);
    const [sitzverteilung, setSitzverteilung] = useState<SeatDistribution>();

    useEffect(() => {
        const getWahlen = async () => {
            try {
                const data = await fetchWahlen();
                setWahlen(data);
            } catch (error) {
                console.error('Error fetching Wahlen:', error);
            }
        };
        getWahlen();
    }, []);

    useEffect(() => {
        const getSitzverteilung = async () => {
            try {
                const data = await fetchSitzveteilung();
                setSitzverteilung(data);
            } catch (error) {
                console.error('Error fetching Sitzverteilung:', error);
            }
        };
        getSitzverteilung();
    });

    return (
        <div className={"flex h-screen"}>
            <div className={"w-64"}>
                <Sidebar/>
            </div>
            <div className={""}>
                <div className={"pt-40"}>
                    <h1>Wahlen</h1>
                    <ul>
                        {wahlen.map((wahl) => (
                            <li key={wahl.id}>{wahl.name} - {wahl.date.toString()}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h1>Sitzverteilung</h1>
                    <p>Anzahl Sitze: {sitzverteilung?.numberofseats}</p>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Partei
                            </th>
                            <th scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sitze
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {sitzverteilung?.distribution.map((partei) => (
                            <tr key={partei.party.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {partei.party.shortname}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {partei.seats}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default App;