import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleLogout, votePrefix } from "../../../utils/Logout";
import WahlzettelC from "./WahlzettelC";
import WarningDialogC from "../../UI-element-components/WarningDialogC";
import AlertC from "../../UI-element-components/AlertC";
import { AlertData } from "../../../models/AlertData";
import { AlertType } from "../../../models/AlertData";
import ResultDialogC from "../../UI-element-components/ResultDialogC";
import { useVote } from "../../../context/VoteContext";
import { submitVote } from "../../../apiServices";

export default function StimmabgabeC() {
    const navigate = useNavigate();
    const [showFinalWarning, setShowFinalWarning] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { wahlkreis, selectedDirectCandidate, selectedParty, token, resetVoting } = useVote();
    const [submitVoteError, setSubmitVoteError] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const alertData: AlertData = {
        type: AlertType.info,
        title: "Stimmabgabe",
        message: "Bitte prüfen Sie Ihre Auswahl und bestätigen Sie die Stimmabgabe oder gehen Sie zurück zum letzten Schritt."
    }

    const vote = async () => {
        setSubmitting(true);
        const success = await submitVote(token ?? "", selectedDirectCandidate?.id ?? null, selectedParty?.partei.id ?? null);
        if (success) {
            setShowSuccess(true);
            setShowFinalWarning(false);
            setSubmitting(false);
            await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
            setSubmitVoteError(true);
            setShowFinalWarning(false);
            setSubmitting(false);
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        handleLogout(resetVoting, navigate, false);
    }

    return (
        <>
            <div className="relative">
                <div className={`flex flex-col items-center ${showFinalWarning ? 'opacity-50' : ''}`}>
                    <AlertC alertData={alertData} />
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
                        onConfirm={() => { setSubmitting(true); vote(); }}
                        onClose={() => { if (!submitting) setShowFinalWarning(false); }}
                        title="Sind Sie sicher?"
                        showLoader={submitting}
                        warnMessage={(!selectedDirectCandidate || !selectedParty) ?
                            "ACHTUNG: Sie sind im Begriff nur eine Stimme abzugeben. Ihre zweite Stimme verfällt." : undefined
                        }
                        message="Die Abgabe Ihrer Stimme ist final. Sie können die Auswahl danach nicht mehr ändern."
                        confirmText="Stimme abgeben"
                        cancelText="Abbrechen"
                    />
                )}
                {showSuccess && (
                    <ResultDialogC success={true} title="Wahl erfolgreich" message="Ihre Stimme wurde gespeichert. Sie werden jetzt abgemeldet." />
                )}
                {submitVoteError && (
                    <ResultDialogC success={false} title="Fehler" message="Es ist ein Fehler aufgetreten. Bitte wenden Sie sich an den Wahlhelfer. Sie werden jetzt abgemeldet." />
                )}
            </div>
        </>
    )
}