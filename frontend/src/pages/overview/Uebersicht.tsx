import SitzverteilungC from "../../components/page-elements/Uebersicht/SitzverteilungC.tsx";
import {fetchErststimmanteile} from '../../apiServices.ts';
import {fetchZweitstimmanteile} from '../../apiServices.ts';
import StimmanteileC from "../../components/page-elements/_shared/StimmenanteileC.tsx";

export default function Stimmverteilungen() {

    return (
        <>
            <SitzverteilungC/>
            <StimmanteileC fetchStimmanteile={fetchZweitstimmanteile} title="Zweitstimmanteile" />
            <StimmanteileC fetchStimmanteile={fetchErststimmanteile} title="Erststimmanteile" />
        </>
    )
}