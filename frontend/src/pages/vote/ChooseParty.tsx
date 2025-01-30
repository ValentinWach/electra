import { useNavigate } from "react-router-dom";
import WahlzettelC from "../../components/page-elements/Vote/WahlzettelC.tsx";
import { votePrefix } from "../../constants/PathPrefixes.ts";
import { handleTokenMissing } from "../../utils/Logout.tsx";
import { useVote } from "../../context/VoteContext.tsx";
import { useEffect } from "react";


export default function ChooseParty() {
    const { wahlkreis, parties, candidates, selectedDirectCandidate, selectedParty, token, resetVoting, wahl } = useVote();
    const navigate = useNavigate();
    const handleGoToStimmabgabe = () => {
        navigate(`${votePrefix}/bestaetigung`);
    };
    useEffect(() => {
        const storedToken = sessionStorage.getItem('token');
        if(!token && !storedToken) {
            handleTokenMissing(resetVoting, navigate);
        }
    }, [token])
    
    return (
        <div className="flex flex-col justify-start items-end">
            <WahlzettelC wahlkreis={wahlkreis} wahl={wahl} directCandidates={candidates} parties={parties?.parteien} />
            <button
                    type="button"
                    onClick={handleGoToStimmabgabe}
                    disabled={!selectedDirectCandidate && !selectedParty}
                    className="mt-5 rounded-md disabled:opacity-50 bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm enabled:hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                Weiter zur Stimmabgabe
            </button>
        </div>
    );
}