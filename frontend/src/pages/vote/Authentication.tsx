import AuthenticationC from "../../components/page-elements/Vote/AuthenticationC.tsx";
import { useVote } from "../../context/VoteContext.tsx";
import { authenticateVoter } from "../../apiServices";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { votePrefix } from "../../utils/Constants.tsx";

export default function Authentication() {
    const { initialize } = useVote();
    const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleAuthenticate = async (token: string) => {
        setIsAuthenticating(true);
        try {
            const response = await authenticateVoter(token);
            if (response.success) {
                sessionStorage.setItem("token", token);
                sessionStorage.setItem("wahlId", response.wahl.id.toString());
                sessionStorage.setItem("wahlkreisId", response.wahlkreis.id.toString());
                await initialize(token, response.wahl.id, response.wahlkreis.id, response.wahl, response.wahlkreis);
                navigate(`${votePrefix}/wahlentscheidung`);
            }
        } catch (error) {
            console.error('Authentication failed:', error);
        } finally {
            setIsAuthenticating(false);
        }
    }

    return <AuthenticationC isAuthenticating={isAuthenticating} onAuthenticate={handleAuthenticate} />;
}