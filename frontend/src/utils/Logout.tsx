import { createElement } from "react";
import ResultDialogC from "../components/UI-element-components/ResultDialogC";
import { createRoot } from "react-dom/client";

export const resultPrefix = "/ergebnisse";
export const votePrefix = "/wahl";

export const handleTokenMissing = (resetVoting: () => void, navigate: (path: string) => void) => {
    sessionStorage.clear();
    resetVoting();
    navigate(`${votePrefix}/authentication`);
};

export const handleLogout = (resetVoting: () => void, navigate: (path: string) => void, showDialog: boolean = true) => {
    if (!showDialog) {
        sessionStorage.clear();
        resetVoting();
        navigate(`${votePrefix}/authentication`);
        return;
    }
    const dialogContainer = document.createElement('div');
    document.body.appendChild(dialogContainer);
    const root = createRoot(dialogContainer);
    
    root.render(createElement(ResultDialogC, {
        title: "Abmeldung erfolgreich",
        message: "Sie werden weitergeleitet",
        success: true
    }));

    setTimeout(() => {
        sessionStorage.clear();
        resetVoting();
        root.unmount();
        document.body.removeChild(dialogContainer);
        navigate(`${votePrefix}/authentication`);
    }, 1300);
};