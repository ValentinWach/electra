import { createElement } from "react";
import SuccessDialogC from "../components/UI-element-components/SuccessDialogC";
import { createRoot } from "react-dom/client";

export const resultPrefix = "/ergebnisse";
export const votePrefix = "/wahl";

export const handleTokenMissing = (resetVoting: () => void, navigate: (path: string) => void) => {
    sessionStorage.clear();
    resetVoting();
    navigate(`${votePrefix}/authentication`);
};

export const handleLogout = (resetVoting: () => void, navigate: (path: string) => void) => {
    const dialogContainer = document.createElement('div');
    document.body.appendChild(dialogContainer);
    const root = createRoot(dialogContainer);
    
    root.render(createElement(SuccessDialogC, {
        title: "Abmeldung erfolgreich",
        message: "Sie werden weitergeleitet"
    }));

    setTimeout(() => {
        sessionStorage.clear();
        resetVoting();
        root.unmount();
        document.body.removeChild(dialogContainer);
        navigate(`${votePrefix}/authentication`);
    }, 1300);
};