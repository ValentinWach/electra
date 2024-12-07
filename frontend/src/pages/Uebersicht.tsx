import SitzverteilungC from "../components/SitzverteilungC.tsx";
import {fetchStimmanteile} from '../apiServices';

import ZweitstimmenanteilC from "../components/ZweitstimmenanteilC.tsx";
import {useElection} from "../context/ElectionContext.tsx";
import {Stimmanteil} from "../api";

export default function Stimmverteilungen() {
    const {selectedElection} = useElection();

    return (
        <div className={"flex flex-col items-center"}>
            <SitzverteilungC/>
            <ZweitstimmenanteilC fetchStimmanteile={fetchStimmanteile} />
        </div>
    )
}