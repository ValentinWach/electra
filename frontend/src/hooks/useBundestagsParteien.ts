import { useState, useEffect } from "react";
import { Partei } from "../api";
import { useElection } from "../context/ElectionContext";
import { fetchSitzveteilung } from "../apiServices";

export function useBundestagsParteien(): { parteien: Partei[], isLoading: boolean } {
    const { selectedElection } = useElection();
    const [parteien, setParteien] = useState<Partei[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchBundestagsParteien() {
            setIsLoading(true);
            try {
                const data = await fetchSitzveteilung(selectedElection?.id ?? 0);
                const parteienData: Partei[] = data.distribution.map(d => d.party);
                setParteien(parteienData);
            } catch (error) {
                console.error('Error fetching Bundestagsparteien:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchBundestagsParteien();
    }, [selectedElection]);

    return { parteien, isLoading };
} 