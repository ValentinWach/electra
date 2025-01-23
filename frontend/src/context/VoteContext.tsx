import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchDirektkandidaten, fetchCompetingParties } from '../apiServices';
import { Abgeordneter, Partei, Wahlkreis, WahlzettelParteien, Wahl } from '../api';

interface VoteContextType {
    token: string | undefined;
    wahlid: number | undefined;
    wahl: Wahl | undefined;
    wahlkreisid: number | undefined;
    wahlkreis: Wahlkreis | undefined;
    parties: WahlzettelParteien | undefined;
    candidates: Abgeordneter[] | undefined;
    selectedDirectCandidateId: number | null;
    selectedPartyId: number | null;
    isVoting: boolean;
    startVoting: (token: string, wahlid: number, wahl: Wahl, wahlkreisid: number, wahlkreis: Wahlkreis, parties: WahlzettelParteien, candidates: Abgeordneter[]) => void;
    setDirectCandidate: (candidateId: number | null) => void;
    setParty: (partyId: number | null) => void;
    resetVoting: () => void;
}

const VoteContext = createContext<VoteContextType | undefined>(undefined);

export const VoteProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<Omit<VoteContextType, 'startVoting' | 'setDirectCandidate' | 'setParty' | 'resetVoting'>>({
        token: undefined,
        wahlid: undefined,
        wahl: undefined,
        wahlkreisid: undefined,
        wahlkreis: undefined,
        parties: undefined,
        candidates: undefined,
        selectedDirectCandidateId: null,
        selectedPartyId: null,
        isVoting: false
    });

    const startVoting = (token: string, wahlid: number, wahl: Wahl, wahlkreisid: number, wahlkreis: Wahlkreis, parties: WahlzettelParteien, candidates: Abgeordneter[]) => {
        setState({
            ...state,
            token,
            wahlid,
            wahl,
            wahlkreisid,
            wahlkreis,
            parties,
            candidates,
            isVoting: true,
            selectedDirectCandidateId: null,
            selectedPartyId: null
        });
    };

    const setDirectCandidate = (candidateId: number | null) => {
        setState({
            ...state,
            selectedDirectCandidateId: candidateId
        });
    };

    const setParty = (partyId: number | null) => {
        setState({
            ...state,
            selectedPartyId: partyId
        });
    };

    const resetVoting = () => {
        setState({
            token: undefined,
            wahlid: undefined,
            wahl: undefined,
            wahlkreisid: undefined,
            wahlkreis: undefined,
            parties: undefined,
            candidates: undefined,
            selectedDirectCandidateId: null,
            selectedPartyId: null,
            isVoting: false
        });
    };

    const value = {
        ...state,
        startVoting,
        setDirectCandidate,
        setParty,
        resetVoting
    };

    return (
        <VoteContext.Provider value={value}>
            {children}
        </VoteContext.Provider>
    );
};

export const useVote = () => {
    const context = useContext(VoteContext);
    if (context === undefined) {
        throw new Error('useVote must be used within a VoteProvider');
    }
    return context;
};
