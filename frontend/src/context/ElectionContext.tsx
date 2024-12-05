import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchWahlen } from '../apiServices';
import { Wahl } from '../api';

interface ElectionContextType {
    elections: Wahl[];
    selectedElection: Wahl | null;
    setSelectedElection: (election: Wahl) => void;
}

const ElectionContext = createContext<ElectionContextType | undefined>(undefined);

export const ElectionProvider = ({ children }: { children: ReactNode }) => {
    const [elections, setElections] = useState<Wahl[]>([]);
    const [selectedElection, setSelectedElection] = useState<Wahl | null>(null);

    useEffect(() => {
        const getElections = async () => {
            try {
                const data = await fetchWahlen();
                setElections(data);
                if (data.length > 0) {
                    setSelectedElection(data[0]); // Set the first election as default
                }
            } catch (error) {
                console.error('Error fetching elections:', error);
            }
        };
        getElections();
    }, []);

    return (
        <ElectionContext.Provider value={{ elections, selectedElection, setSelectedElection }}>
            {children}
        </ElectionContext.Provider>
    );
};

export const useElection = () => {
    const context = useContext(ElectionContext);
    if (context === undefined) {
        throw new Error('useElection must be used within an ElectionProvider');
    }
    return context;
};