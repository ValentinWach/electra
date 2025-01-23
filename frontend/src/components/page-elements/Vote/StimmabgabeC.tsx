import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { votePrefix } from "../../../utils/Logout";
import WahlzettelC from "./WahlzettelC";
import WarningDialogC from "../../UI-element-components/WarningDialogC";
import AlertC from "../../UI-element-components/AlertC";
import { AlertData } from "../../../models/AlertData";
import { AlertType } from "../../../models/AlertData";
import SuccessDialogC from "../../UI-element-components/SuccessDialogC";
import { useVote } from "../../../context/VoteContext";

export default function StimmabgabeC() {
    const navigate = useNavigate();
    const [showFinalWarning, setShowFinalWarning] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { wahlkreis, selectedDirectCandidate, selectedParty } = useVote();

    const alertData: AlertData = {
        type: AlertType.info,
        title: "Stimmabgabe",
        message: "Bitte prüfen Sie Ihre Auswahl und bestätigen Sie die Stimmabgabe oder gehen Sie zurück zum letzten Schritt."
    }

    return (
        <>
            <AlertC alertData={alertData} />
            <div className="relative">
                <div className={`flex flex-col items-center ${showFinalWarning ? 'opacity-50' : ''}`}>
                    <WahlzettelC 
                        checkMode={true} 
                        wahlkreis={wahlkreis} 
                        directCandidates={selectedDirectCandidate ? [selectedDirectCandidate] : []} 
                        parties={selectedParty ? [selectedParty] : []} 
                    />
                    <div className="w-full flex flex-row gap-2 items-end justify-end">
                        <button
                            type="button"
                            className="mt-5 rounded-md bg-rose-800 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            onClick={() => { navigate(`${votePrefix}/wahlentscheidung`); }}
                        >
                            Auswahl ändern
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowFinalWarning(true)}
                            disabled={!selectedDirectCandidate && !selectedParty}
                            className="mt-5 rounded-md bg-indigo-600 px-3 py-1.5 disabled:opacity-50 text-sm font-semibold text-white shadow-sm hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                        {(selectedDirectCandidate && !selectedParty) || (!selectedDirectCandidate && selectedParty) ? "Stimme abgeben" : "Stimmen abgeben"}
                        </button>
                    </div>
                </div>
                {showFinalWarning && (
                    <WarningDialogC 
                        onConfirm={() => {setShowFinalWarning(false); setShowSuccess(true); }} 
                        onClose={() => {setShowFinalWarning(false);}}
                        title="Sind Sie sicher?" 
                        warnMessage={(!selectedDirectCandidate || !selectedParty) ? 
                            "ACHTUNG: Sie sind im Begriff nur eine Stimme abzugeben. Ihre zweite Stimme verfällt." : undefined
                        }
                        message="Die Abgabe Ihrer Stimme ist final. Sie können die Auswahl danach nicht mehr ändern."
                        confirmText="Stimme abgeben" 
                        cancelText="Abbrechen"
                    />
                )}
                {showSuccess && (
                    <SuccessDialogC title="Wahl erfolgreich" message="Ihre Stimme wurde erfolgreich gespeichert. Sie werden jetzt abgemeldet." />
                )}
            </div>
        </>
    )
}