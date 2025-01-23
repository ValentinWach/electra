import AuthenticationC from "../../components/page-elements/Vote/AuthenticationC.tsx";
import { useVote } from "../../context/VoteContext.tsx";
import { authenticateVoter } from "../../apiServices";
import { fetchDirektkandidaten, fetchCompetingParties } from "../../apiServices";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { votePrefix } from "../../utils/Constants.tsx";

export default function Authentication() {
    const { startVoting } = useVote();
    const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleAuthenticate = async (token: string) => {
        setIsAuthenticating(true);
        const response = await authenticateVoter(token);
        if (response.success) {
            const [direktkandidaten, parties] = await Promise.all([fetchDirektkandidaten(response.wahl.id, response.wahlkreis.id), fetchCompetingParties(response.wahl.id, response.wahlkreis.id)]);
            startVoting(token, response.wahl.id, response.wahl, response.wahlkreis.id, response.wahlkreis, parties, direktkandidaten.kandidaten);
        }
        setIsAuthenticating(false);
        navigate(`${votePrefix}/wahlentscheidung`);
    }
    return <AuthenticationC onAuthenticate={handleAuthenticate} /*isAuthenticating={isAuthenticating}*/ />;
}