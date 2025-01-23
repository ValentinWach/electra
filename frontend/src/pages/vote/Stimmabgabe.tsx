import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StimmabgabeC from "../../components/page-elements/Vote/StimmabgabeC";
import { votePrefix, handleTokenMissing } from "../../utils/Logout";
import { useVote } from "../../context/VoteContext";

export default function Stimmabgabe() {
    const { token, selectedDirectCandidate, selectedParty, resetVoting } = useVote();
    const navigate = useNavigate();
    useEffect(() => {
        const storedToken = sessionStorage.getItem('token');
        if(!token && !storedToken) {
            handleTokenMissing(resetVoting, navigate);
        }
        else if(!selectedDirectCandidate && !selectedParty) {
            navigate(`${votePrefix}/wahlentscheidung`);
        }
    }, [token, selectedDirectCandidate, selectedParty])
    return (
        <StimmabgabeC />
    )
}