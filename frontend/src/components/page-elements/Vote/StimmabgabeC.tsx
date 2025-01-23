import { useState } from "react";
import WahlzettelC from "./WahlzettelC";
import WarningDialogC from "../../UI-element-components/WarningDialogC";
import AlertC from "../../UI-element-components/AlertC";
import { AlertData } from "../../../models/AlertData";
import { AlertType } from "../../../models/AlertData";
import SuccessDialogC from "../../UI-element-components/SuccessDialogC";
import { useVote } from "../../../context/VoteContext";

export default function StimmabgabeC() {
    const [showFinalWarning, setShowFinalWarning] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { wahlkreis, parties, candidates, selectedDirectCandidateId, selectedPartyId } = useVote();

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
                    <WahlzettelC checkMode={true} wahlkreis={wahlkreis} directCandidates={candidates?.filter(candidate => candidate.id === selectedDirectCandidateId)} parties={parties?.parteien?.filter(party => party.partei.id === selectedPartyId) ?? []} onSelectDirectCandidate={() => {}} onSelectParty={() => {}} />
                    <div className="w-full flex flex-row gap-2 items-end justify-end">
                        <button
                            type="button"
                            className="mt-5 rounded-md bg-rose-800 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Auswahl ändern
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowFinalWarning(true)}
                            className="mt-5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Stimme Abgeben
                        </button>
                    </div>
                </div>
                {showFinalWarning && (
                    <WarningDialogC onConfirm={() => {setShowFinalWarning(false); setShowSuccess(true);}} title="Sind Sie sicher?" message="Die Abgabe Ihrer Stimme ist final. Sie können die Auswahl danach nicht mehr ändern." confirmText="Stimme abgeben" cancelText="Abbrechen" />
                )}
                {showSuccess && (
                    <SuccessDialogC title="Wahl erfolgreich" message="Ihre Stimme wurde erfolgreich gespeichert. Sie werden jetzt abgemeldet." />
                )}
            </div>
        </>
    )
}