import SitzverteilungC from "../../components/page-elements/Uebersicht/SitzverteilungC.tsx";
import {fetchStimmanteile} from '../../apiServices.ts';
import ZweitstimmenanteilC from "../../components/page-elements/_shared/ZweitstimmenanteilC.tsx";

export default function Stimmverteilungen() {

    return (
        <>
            <SitzverteilungC/>
            <ZweitstimmenanteilC fetchStimmanteile={fetchStimmanteile} />
        </>
    )
}