import Sitzverteilung from "../components/Sitzverteilung.tsx";
import {fetchStimmanteile} from '../apiServices';

import Zweitstimmenanteil from "../components/Zweitstimmenanteil.tsx";
import {useElection} from "../context/ElectionContext.tsx";
import {Stimmanteil} from "../api";

export default function Stimmverteilungen() {
    const {selectedElection} = useElection();

    return (
        <div className={"flex flex-col items-center"}>
            <Sitzverteilung/>
            <Zweitstimmenanteil fetchStimmanteile={fetchStimmanteile} />
        </div>
    )
}