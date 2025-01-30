import { recalculateResults } from "../../../apiServices";
import { AlertType } from "../../../models/AlertData";
import AlertC from "../../UI-element-components/AlertC";
import ProgressLoaderFullWidthC from "../_shared/ProgressLoaderFullWidthC";
import PrimaryButtonC from "../../UI-element-components/PrimaryButtonC";
import { useState } from "react";

export default function RecalculateResultsC() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean | undefined>(undefined);

    const handleRecalculateResults = async () => {
        setIsLoading(true);
        let success = await recalculateResults();
        setIsLoading(false);
        setSuccess(success);
    }

    return (
        <div className="flex flex-col gap-4 w-3/4 2xl:w-[60%]">
            <h1 className="text-2xl font-bold">Wahladministration</h1>
            <div className="flex flex-col w-full">
                { isLoading ?
                    <AlertC alertData={{
                        message: `Stimmen werden aggregiert und die Ergebnisse neu berechnet...`,
                        type: AlertType.info
                    }} />
                : success === false ?
                    <AlertC alertData={{
                        message: `Fehler beim Neuberechnen der Ergebnisse.`,
                        type: AlertType.error
                    }} />
                : success === true ?
                    <AlertC alertData={{
                        message: `Ergebnisse wurden erfolgreich neu berechnet.`,
                        type: AlertType.success
                    }} />
                :
                    <AlertC alertData={{
                        message: `Ergebnisse sollten nur nach abgeschlossener Wahl neu berechnet werden.`,
                        type: AlertType.info
                    }} />
                }
                {isLoading && <div className="w-full -mt-11">
                    <ProgressLoaderFullWidthC />
                </div>}
            </div>
            <div className={`flex ${isLoading ? "" : "-mt-3"} flex-col w-full`}>
                <PrimaryButtonC disabled={isLoading} width="w-52" label="Ergebnisse neu berechnen" size="md" onClick={() => handleRecalculateResults()} />
            </div>
        </div>
    );
}