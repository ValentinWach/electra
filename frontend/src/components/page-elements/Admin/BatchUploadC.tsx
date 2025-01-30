import { batchUpload } from "../../../apiServices";
import { AlertType } from "../../../models/AlertData";
import AlertC from "../../UI-element-components/AlertC";
import ProgressLoaderFullWidthC from "../_shared/ProgressLoaderFullWidthC";
import { useCallback, useState } from "react";
import { useDropzone } from 'react-dropzone';

export default function BatchUploadC() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean | undefined>(undefined);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) {
            setSuccess(false);
            return;
        }

        const file = acceptedFiles[0];
        if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
            setSuccess(false);
            return;
        }
        await handleBatchUpload(file);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv']
        },
        maxFiles: 1
    });

    const handleBatchUpload = async (file: File) => {
        setIsLoading(true);
        let success = await batchUpload(file);
        setIsLoading(false);
        setSuccess(success);
    }

    return (
        <div className="flex flex-col gap-4 w-3/4 2xl:w-[60%]">
            <h1 className="text-2xl font-bold">Batch-Upload</h1>
            <div className="flex flex-col w-full">
                <div className="mt-4">
                    {isLoading ? (
                        <AlertC alertData={{
                            message: `Stimmen werden hochgeladen und verarbeitet...`,
                            type: AlertType.info
                        }} />
                    ) : success === false ? (
                        <AlertC alertData={{
                            message: `Fehler beim Hochladen der Stimmen. Bitte stellen Sie sicher, dass es sich um eine gültige CSV-Datei handelt.`,
                            type: AlertType.error
                        }} />
                    ) : success === true ? (
                        <AlertC alertData={{
                            message: `Stimmen wurden erfolgreich hochgeladen und verarbeitet.`,
                            type: AlertType.success
                        }} />
                    ) : (
                        <AlertC alertData={{
                            message: `Bitte wählen Sie eine CSV-Datei mit den Stimmen aus.`,
                            type: AlertType.info
                        }} />
                    )}
                    {isLoading && <div className="w-full mb-5 -mt-7">
                        <ProgressLoaderFullWidthC />
                    </div>}
                </div>
                <div {...getRootProps()} className={`p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}>
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <p className="text-center text-gray-600">CSV-Datei hier ablegen...</p>
                    ) : (
                        <p className="text-center text-gray-600">
                            Ziehen Sie eine CSV-Datei hierher oder klicken Sie zum Auswählen
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}