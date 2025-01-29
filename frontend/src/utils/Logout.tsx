import { createElement } from "react";
import ResultDialogC from "../components/UI-element-components/ResultDialogC";
import { createRoot } from "react-dom/client";
import { votePrefix } from "../constants/PathPrefixes";

export const handleTokenMissing = (resetVoting: () => void, navigate: (path: string) => void) => {
    sessionStorage.clear();
    resetVoting();
    navigate(`${votePrefix}/authentifizierung`);
};

export const handleLogout = (resetVoting: () => void, navigate: (path: string) => void, showDialog: boolean = true, logoutBecauseOfSessionTimeout: boolean = false) => {
    if (!showDialog) {
        sessionStorage.clear();
        resetVoting();
        navigate(`${votePrefix}/authentifizierung`);
        return;
    }
    const dialogContainer = document.createElement('div');
    document.body.appendChild(dialogContainer);
    const root = createRoot(dialogContainer);
    if(logoutBecauseOfSessionTimeout) {
        root.render(createElement(ResultDialogC, {
            title: "Sitzung abgelaufen",
            message: "Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.",
            success: false
        }));
    } else {
        root.render(createElement(ResultDialogC, {
            title: "Abmeldung erfolgreich",
            message: "Sie werden weitergeleitet",
            success: true
        }));
    }

    setTimeout(() => {
        sessionStorage.clear();
        resetVoting();
        root.unmount();
        document.body.removeChild(dialogContainer);
        navigate(`${votePrefix}/authentifizierung`);
    }, logoutBecauseOfSessionTimeout ? 3000 : 1500);
};