import SitzverteilungC from "../components/SitzverteilungC.tsx";
import {fetchStimmanteile} from '../apiServices';
import ZweitstimmenanteilC from "../components/ZweitstimmenanteilC.tsx";

export default function Stimmverteilungen() {

    return (
        <div className={"flex flex-col items-center"}>
            <SitzverteilungC/>
            <ZweitstimmenanteilC fetchStimmanteile={fetchStimmanteile} />
        </div>
    )
}