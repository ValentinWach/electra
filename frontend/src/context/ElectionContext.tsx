import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchWahlen } from '../apiServices';
import { Wahl } from '../api';

interface ElectionContextType {
    elections: Wahl[];
    selectedElection: Wahl;
    setSelectedElection: (election: Wahl) => void;
    isLoading: boolean;
}

const ElectionContext = createContext<ElectionContextType | undefined>(undefined);

export const ElectionProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<{
        elections: Wahl[];
        selectedElection: Wahl | null;
        isLoading: boolean;
    }>({
        elections: [],
        selectedElection: null,
        isLoading: true
    });

    useEffect(() => {
        const getElections = async () => {
            try {
                const data = await fetchWahlen();
                if (data.length > 0) {
                    setState({
                        elections: data,
                        selectedElection: data[0],
                        isLoading: false
                    });
                }
            } catch (error) {
                console.error('Error fetching elections:', error);
            }
        };
        getElections();
    }, []);

    // Only render children when we have a valid selectedElection
    if (state.selectedElection === null) {
        return null;
    }

    return (
        <ElectionContext.Provider 
            value={{
                elections: state.elections,
                selectedElection: state.selectedElection,
                setSelectedElection: (election: Wahl) => 
                    setState(prev => ({ ...prev, selectedElection: election })),
                isLoading: state.isLoading
            }}
        >
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