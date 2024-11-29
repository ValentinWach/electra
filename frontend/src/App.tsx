import {useEffect, useState} from 'react';
import {fetchWahlen, fetchSitzveteilung} from './apiServices';
import {SeatDistribution, Wahl} from "./api";

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
        <>
            <div className={"bg-red-400"}>
                <h1 className={"text-blue-400"}>Wahlen</h1>
                <ul>
                    {wahlen.map((wahl) => (
                        <li key={wahl.id}>{wahl.name} - {wahl.date.toString()}</li>
                    ))}
                </ul>
            </div>
            <div>
                <h1 className={"text-blue-400"}>Sitzverteilung</h1>
                <p>Anzahl Sitze: {sitzverteilung?.numberofseats}</p>
                <ul>
                    {sitzverteilung?.distribution.map((partei) => (
                        <li key={partei.party.id}>{partei.party.shortname} : {partei.seats}</li>
                    ))}
                </ul>
            </div>
        </>
    );
};

export default App;