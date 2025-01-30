import { useEffect, useState } from "react";
import TextAreaC from "../../UI-element-components/TextAreaC";
import { fetchWahlen, generateTokens } from "../../../apiServices";
import { Token, Wahl } from "../../../api";
import PrimaryButtonC from "../../UI-element-components/PrimaryButtonC";
import { DropdownData } from "../../../models/DropDownData";
import DropdownC from "../../UI-element-components/DropdownC";
import TextInputC from "../../UI-element-components/TextInputC";

export default function GenerateTokenC() {
    const [generatedTokens, setGeneratedTokens] = useState<Token[] | null>(null);
    const [elections, setElections] = useState<Wahl[] | null>(null);
    const [selectedElection, setSelectedElection] = useState<Wahl | null>(null);
    const [selectedWahlkreisId, setSelectedWahlkreisId] = useState<number | null>(null);
    const [idNumbers, setIdNumbers] = useState<string>("");

    useEffect(() => {
        const getElections = async () => {
            try {
                const data = await fetchWahlen();
                setElections(data);
            } catch (error) {
                console.error('Error fetching elections:', error);
            }
        };
        getElections();
    }, []);

    const handleGenerateTokens = async (idNumbers: string) => {
        setGeneratedTokens(null);
        const idNumbersArray = idNumbers.split(',').map((id: string) => id.replace(/\s+/g, '').trim());
        //if(!selectedElection || !selectedWahlkreis) return;
        //const tokens = await generateTokens(idNumbersArray.length, idNumbersArray, selectedElection.id, selectedWahlkreis.id);
        const tokens = await generateTokens(idNumbersArray.length, idNumbersArray, selectedElection?.id ?? 1, selectedWahlkreisId ?? 1);
        setGeneratedTokens(tokens);
    }

    const handleElectionSelect = (id: number) => {
        const election = elections?.find(e => e.id === id) ?? null;
        setSelectedElection(election);
    };

    const WahlDD: DropdownData = {
        items: elections?.map(election => ({
            label: election.date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }),
            id: election.id
        })) ?? [],
        defaultChosenId: elections?.[0]?.id ?? 1,
        label: "Wahljahr"
    };

    return (
        <div className="flex flex-col gap-4 w-1/2">
            <h1 className="text-2xl font-bold">Wahltokengenerierung</h1>
            <div className="flex flex-row gap-2">
                <DropdownC dropdownData={WahlDD} dropDownFunction={handleElectionSelect} />
                <TextInputC label="Wahlkreisnummer" placeholder="100" id="wahlkreisnummer" name="wahlkreisnummer" inputFunction={(value: string) => {setSelectedWahlkreisId(parseInt(value))}} />
            </div>
            {/*<InputC label="Anzahl der Wahltoken" placeholder="100" id="amount" name="amount" />*/}
            <TextAreaC label="Ausweisnummern (getrennt durch Kommas)" placeholder="L0X123456X, T2Y987654, M9Z456789" id="ausweisnummern" name="ausweisnummern" rows={4} inputFunction={setIdNumbers} />
            {generatedTokens && <TextAreaC inputFunction={setIdNumbers} label="Generierte Wahltoken" placeholder={JSON.stringify(generatedTokens)} id="generatedTokens" name="generatedTokens" rows={4} />}
            <PrimaryButtonC disabled={idNumbers == ""} label="Wahltokens generieren" size="md" onClick={() => handleGenerateTokens(idNumbers)} />
        </div>
    );
}