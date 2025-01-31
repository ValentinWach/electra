import SitzverteilungC from "../../components/page-elements/Uebersicht/SitzverteilungC.tsx";
import {fetchErststimmanteile} from '../../apiServices.ts';
import {fetchZweitstimmanteile} from '../../apiServices.ts';
import StimmanteileC from "../../components/page-elements/_shared/StimmenanteileC.tsx";

export default function Stimmverteilungen() {

    return (
        <>
            <SitzverteilungC/>
            <StimmanteileC fetchStimmanteileZweitstimmen={fetchZweitstimmanteile} fetchStimmanteileErststimmen={fetchErststimmanteile} title="Stimmanteile" />
        </>
    )
}