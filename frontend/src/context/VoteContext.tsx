import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Abgeordneter, Wahlkreis, WahlzettelParteien, Wahl, WahlzettelParteiWrapper } from '../api';
import { authenticateVoter, fetchDirektkandidaten} from '../apiServices';
import { fetchCompetingParties } from '../apiServices';
import { useNavigate } from 'react-router-dom';
import { handleLogout } from '../utils/Logout';

// Session timeout in milliseconds (10 minutes)
const SESSION_TIMEOUT = 1000 * 60 * 10;

interface VoteContextType {
    token: string | undefined;
    idNumber: string | undefined;
    wahl: Wahl | undefined;
    wahlkreis: Wahlkreis | undefined;
    parties: WahlzettelParteien | undefined;
    candidates: Abgeordneter[] | undefined;
    selectedDirectCandidate: Abgeordneter | null;
    selectedParty: WahlzettelParteiWrapper | null;
    isVoting: boolean;
    setSelectedDirectCandidate: (candidate: Abgeordneter | null) => void;
    setSelectedParty: (party: WahlzettelParteiWrapper | null) => void;
    resetVoting: () => void;
    initialize: (token: string, idNumber: string, wahlId: number, wahlkreisId: number, wahl?: Wahl, wahlkreis?: Wahlkreis) => Promise<void>;
}

const VoteContext = createContext<VoteContextType | undefined>(undefined);

export const VoteProvider = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();
    let sessionTimeout: NodeJS.Timeout;

    const initialize = async (token: string, idNumber: string, wahlId: number, wahlkreisId: number, wahl?: Wahl, wahlkreis?: Wahlkreis) => {
        try {
            const [direktkandidaten, parties] = await Promise.all([
                fetchDirektkandidaten(wahlId, wahlkreisId),
                fetchCompetingParties(wahlId, wahlkreisId),
            ]);
            if(wahl === undefined || wahlkreis === undefined) {
                const response = await authenticateVoter(token, idNumber);
                if(response.authenticated) {
                    wahl = response.wahl;
                    wahlkreis = response.wahlkreis;
                }
            }
            setState(prevState => ({
                ...prevState,
                token,
                idNumber,
                wahl,
                wahlkreis,
                parties,
                candidates: direktkandidaten.kandidaten,
                isVoting: true,
                selectedDirectCandidate: null,
                selectedParty: null
            }));
        } catch (error) {
            console.error('Failed to initialize voting context:', error);
            throw error;
        }
    };

    const [state, setState] = useState<Omit<VoteContextType, 'setSelectedDirectCandidate' | 'setSelectedParty' | 'resetVoting'>>({
        token: undefined,
        idNumber: undefined,
        wahl: undefined,
        wahlkreis: undefined,
        parties: undefined,
        candidates: undefined,
        selectedDirectCandidate: null,
        selectedParty: null,
        isVoting: false,
        initialize
    });

    // Initialize on page reload
    useEffect(() => {
        const storedToken = sessionStorage.getItem('token');
        const storedIdNumber = sessionStorage.getItem('idNumber');
        const storedWahlId = sessionStorage.getItem('wahlId');
        const storedWahlkreisId = sessionStorage.getItem('wahlkreisId');
        
        if (storedToken && storedIdNumber && storedWahlId && storedWahlkreisId) {
            initialize(
                storedToken,
                storedIdNumber,
                parseInt(storedWahlId),
                parseInt(storedWahlkreisId)
            ).catch(console.error);
        }

        // Cleanup function
        return () => {
            if (sessionTimeout) {
                clearTimeout(sessionTimeout);
            }
        };
    }, []);

    // Reset session timeout on any state change
    useEffect(() => {
        if (state.token) {
            if (sessionTimeout) {
                clearTimeout(sessionTimeout);
            }
            sessionTimeout = setTimeout(() => {
                handleLogout(resetVoting, navigate, true, true);
            }, SESSION_TIMEOUT);
        }

        return () => {
            if (sessionTimeout) {
                clearTimeout(sessionTimeout);
            }
        };
    }, [state]);

    const setSelectedDirectCandidate = (candidate: Abgeordneter | null) => {
        setState(prevState => ({
            ...prevState,
            selectedDirectCandidate: candidate ?? null
        }));
    };

    const setSelectedParty = (party: WahlzettelParteiWrapper | null) => {
        setState(prevState => ({
            ...prevState,
            selectedParty: party ?? null
        }));
    };

    const resetVoting = () => {
        setState({
            token: undefined,
            idNumber: undefined,
            wahl: undefined,
            wahlkreis: undefined,
            parties: undefined,
            candidates: undefined,
            selectedDirectCandidate: null,
            selectedParty: null,
            isVoting: false,
            initialize
        });
    };

    const value = {
        ...state,
        setSelectedDirectCandidate,
        setSelectedParty,
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