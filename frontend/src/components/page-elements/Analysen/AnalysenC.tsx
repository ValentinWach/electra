import {Partei} from "../../../api/index.ts";
import {useEffect, useState} from 'react';
import {fetchSitzveteilung} from "../../../apiServices.ts";
import {useElection} from "../../../context/ElectionContext.tsx";
import ForeignerShareC from "./ForeignerShareC.tsx";
import IncomeC from "./IncomeC.tsx";

export default function AnalysenC() {
    const {selectedElection} = useElection();
    const [parteien, setParteien] = useState<Partei[]>([]);

    useEffect(() => {
        async function fetchParteien() {
            try {
                const data = await fetchSitzveteilung(selectedElection?.id ?? 0);
                const parteienData: Partei[] = data.distribution.map(d => d.party);
                setParteien(parteienData);
            } catch (error) {
                console.error('Error fetching Parteien:', error);
            }
        }

        fetchParteien();
    }, [selectedElection]);

    return (
        <>
            <IncomeC parteien={parteien} />
            <ForeignerShareC parteien={parteien} />
        </>
    );
}