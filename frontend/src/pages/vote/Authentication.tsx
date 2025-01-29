import AuthenticationC from "../../components/page-elements/Vote/AuthenticationC.tsx";
import { useVote } from "../../context/VoteContext.tsx";
import { authenticateVoter } from "../../apiServices";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { votePrefix } from "../../constants/PathPrefixes.ts";


export default function Authentication() {
    const { initialize } = useVote();
    const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
    const [authentificationError, setAuthentificationError] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleAuthenticate = async (token: string, idNumber: string) => {
        setIsAuthenticating(true);
        if (authentificationError) {
            console.log("Authentification error already");
            setAuthentificationError(false);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        try {
            const response = await authenticateVoter(token, idNumber);
            if (response.authenticated) {
                setAuthentificationError(false);
                sessionStorage.setItem("token", token);
                sessionStorage.setItem("idNumber", idNumber);
                sessionStorage.setItem("wahlId", response.wahl.id.toString());
                sessionStorage.setItem("wahlkreisId", response.wahlkreis.id.toString());
                await initialize(token, idNumber, response.wahl.id, response.wahlkreis.id, response.wahl, response.wahlkreis);
                navigate(`${votePrefix}/wahlzettel`);
            }
            else {
                setAuthentificationError(true);
            }
        } catch (error) {
            console.error('Authentication failed:', error);
            setAuthentificationError(true);
        } finally {
            setIsAuthenticating(false);
        }
    }

    return <AuthenticationC authentificationError={authentificationError} isAuthenticating={isAuthenticating} onAuthenticate={handleAuthenticate} />;
}