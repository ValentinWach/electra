import { recalculateResults } from "../../../apiServices";
import { AlertType } from "../../../models/AlertData";
import AlertC from "../../UI-element-components/AlertC";
import ProgressLoaderFullWidthC from "../_shared/ProgressLoaderFullWidthC";
import PrimaryButtonC from "../../UI-element-components/PrimaryButtonC";
import { useState } from "react";

export default function RecalculateResultsC() {
    const [isLoading, setIsLoading] = useState(false);

    const handleRecalculateResults = async () => {
        setIsLoading(true);
        await recalculateResults();
        setIsLoading(false);
    }

    return (
        <div className="flex flex-col gap-4 w-1/2">
            <h1 className="text-2xl font-bold">Wahladministration</h1>
            <div className="flex flex-col w-full">
                <AlertC alertData={{
                    message: isLoading ? `Ergebnisse werden neu berechnet...` : `Ergebnisse sollten nur nach abgeschlossener Wahl neu berechnet werden.`,
                    type: AlertType.info
                }} />
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