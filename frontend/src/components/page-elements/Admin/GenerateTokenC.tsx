import { useEffect, useState } from "react";
import TextAreaC from "../../UI-element-components/TextAreaC";
import { fetchWahlen, generateTokens } from "../../../apiServices";
import { Token, Wahl } from "../../../api";
import PrimaryButtonC from "../../UI-element-components/PrimaryButtonC";
import { DropdownData } from "../../../models/DropDownData";
import DropdownC from "../../UI-element-components/DropdownC";
import TextInputC from "../../UI-element-components/TextInputC";
import ProgressLoaderFullWidthC from "../_shared/ProgressLoaderFullWidthC";
import AlertC from "../../UI-element-components/AlertC";
import { AlertType } from "../../../models/AlertData";

export default function GenerateTokenC() {

    const [generatedTokens, setGeneratedTokens] = useState<Token[] | null>(null);
    const [elections, setElections] = useState<Wahl[] | null>(null);
    const [selectedElection, setSelectedElection] = useState<Wahl | null>(null);
    const [selectedWahlkreisId, setSelectedWahlkreisId] = useState<number | null>(null);
    const [idNumbers, setIdNumbers] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);

    const defaultDD: DropdownData = {
        items: elections?.map(election => ({
            label: election.date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }),
            id: election.id
        })) ?? [],

        defaultChosenId: selectedElection?.id ?? 1,
        label: "Wahljahr"
    };
    const [dropdownData, setDropdownData] = useState<DropdownData>(defaultDD);


    useEffect(() => {
        const getElections = async () => {
            try {
                const data = await fetchWahlen();
                setElections(data);
                setSelectedElection(data[0]);
            } catch (error) {
                console.error('Error fetching elections:', error);
            }
        };
        getElections();
    }, []);

    const handleGenerateTokens = async (idNumbers: string) => {
        if (selectedElection != null && selectedWahlkreisId != null) {
            try {
                setIsLoading(true);
                setGeneratedTokens(null);
                const idNumbersArray = idNumbers.split(',').map((id: string) => id.replace(/\s+/g, '').trim());
                const tokens = await generateTokens(idNumbersArray.length, idNumbersArray, selectedElection?.id ?? 1, selectedWahlkreisId ?? 1);
                setIsLoading(false);
                setGeneratedTokens(tokens);
                setIsError(false);
            } catch (error) {
                console.error('Error generating tokens:', error);
                setIsLoading(false);
                setIsError(true);
            }
        }
    }

    const handleElectionSelect = (id: number) => {
        const election = elections?.find(e => e.id === id) ?? null;
        setSelectedElection(election);
    };

    useEffect(() => {
        const setDropdownDataFunc = () => {
            if (selectedElection != null) {
                const WahlDD: DropdownData = {
                    items: elections?.map(election => ({
                        label: election.date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }),
                        id: election.id
                    })) ?? [],

                    defaultChosenId: selectedElection.id,
                    label: "Wahljahr"
                };
                setDropdownData(WahlDD);
            }
        };
        setDropdownDataFunc();
    }, [selectedElection]);

    const formatReturnedTokens = (tokens: Token[]): string => tokens.map(token => `${token.idNumber}: ${token.token}`).join('\n');

    const handleExportCSV = () => {
        if (!generatedTokens) return;
        
        const csvContent = '\uFEFF' + [
            'Ausweisnummer,Token',
            ...generatedTokens.map(token => `${token.idNumber},${token.token}`)
        ].join('\r\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'wahltokens.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col gap-4 w-3/4 2xl:w-[60%]">
            <h1 className="text-2xl font-bold">Wahltokengenerierung</h1>
            <div className="flex flex-row gap-2">
                <DropdownC dropdownData={dropdownData} dropDownFunction={handleElectionSelect} />
                <TextInputC label="Wahlkreisnummer" placeholder="100" id="wahlkreisnummer" name="wahlkreisnummer" inputFunction={(value: string) => { setSelectedWahlkreisId(parseInt(value)) }} />
            </div>
            <TextAreaC maxHeight={300} label="Ausweisnummern (getrennt durch Kommas)" placeholder="L0X123456X, T2Y987654, M9Z456789" id="ausweisnummern" name="ausweisnummern" rows={4} inputFunction={setIdNumbers} />
            {generatedTokens && <TextAreaC maxHeight={300} inputFunction={setIdNumbers} label="Generierte Wahltoken" defaultValue={formatReturnedTokens(generatedTokens)} id="generatedTokens" name="generatedTokens" rows={4} />}
            {isLoading && <div className="flex flex-col w-full -mt-5">
                <ProgressLoaderFullWidthC />
            </div>}
            {isError && <AlertC alertData={{
                message: `Fehler beim Generieren der Wahltokens. Haben Sie eine gültige Wahlkreisnummer eingegeben?`,
                type: AlertType.error
            }} />}
            <div className="flex flex-row gap-4">
                <PrimaryButtonC width="w-52" disabled={idNumbers == "" || selectedElection == null || selectedWahlkreisId == null} label="Wahltokens generieren" size="md" onClick={() => handleGenerateTokens(idNumbers)} />
                <PrimaryButtonC width="w-52" disabled={!generatedTokens} label="Als CSV exportieren" size="md" onClick={handleExportCSV} />
            </div>
        </div>
    );
}