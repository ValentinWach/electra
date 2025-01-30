import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmationC from "../../components/page-elements/Vote/ConfirmationC.tsx";
import { votePrefix } from "../../constants/PathPrefixes.ts";
import { handleTokenMissing } from "../../utils/Logout.tsx";
import { useVote } from "../../context/VoteContext.tsx";


export default function Confirmation() {
    const { token, selectedDirectCandidate, selectedParty, resetVoting } = useVote();
    const navigate = useNavigate();
    useEffect(() => {
        const storedToken = sessionStorage.getItem('token');
        if(!token && !storedToken) {
            handleTokenMissing(resetVoting, navigate);
        }
        else if(!selectedDirectCandidate && !selectedParty) {
            navigate(`${votePrefix}/wahlzettel`);
        }
    }, [token, selectedDirectCandidate, selectedParty])
    return (
        <ConfirmationC />
    )
}