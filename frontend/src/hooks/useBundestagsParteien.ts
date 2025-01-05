import { useState, useEffect } from "react";
import { Partei } from "../api";
import { useElection } from "../context/ElectionContext";
import { fetchSitzveteilung } from "../apiServices";

export function useBundestagsParteien() {
    const { selectedElection } = useElection();
    const [parteien, setParteien] = useState<Partei[]>([]);

    useEffect(() => {
        async function fetchBundestagsParteien() {
            try {
                const data = await fetchSitzveteilung(selectedElection?.id ?? 0);
                const parteienData: Partei[] = data.distribution.map(d => d.party);
                setParteien(parteienData);
            } catch (error) {
                console.error('Error fetching Bundestagsparteien:', error);
            }
        }

        fetchBundestagsParteien();
    }, [selectedElection]);

    return parteien;
} 