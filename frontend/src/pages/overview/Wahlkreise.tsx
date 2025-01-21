import { useEffect, useState } from "react";
import {
    fetchWahlkreise} from "../../apiServices.ts";
import { Wahlkreis } from "../../api/index.ts";
import { useElection } from "../../context/ElectionContext.tsx";
import WahlkreislisteC from "../../components/page-elements/Wahlkreise/WahlkreislisteC.tsx";
import WahlkreisMapC from "../../components/page-elements/Wahlkreise/WahlkreisMapC.tsx";
import { useNavigate } from 'react-router-dom';
import { resultPrefix } from "../../utils/Constants.tsx";

export default function Wahlkreise() {

    const { selectedElection } = useElection();
    const [wahlkreise, setWahlkreise] = useState<Wahlkreis[]>();
    const navigate = useNavigate();


    useEffect(() => {
        const getWahlkreise = async () => {
            try {
                const data = await fetchWahlkreise();
                setWahlkreise(data);
            } catch (error) {
                console.error('Error fetching Wahlkreise:', error);
            }
        };
        getWahlkreise();
    }, [selectedElection]);


    const showWahlkreisDetails = (id: number) => {
        const selectedWahlkreis = wahlkreise?.find(wahlkreis => wahlkreis.id === id);
        if (selectedWahlkreis) {
            navigate(`${resultPrefix}/wahlkreise/${id}`, { state: { wahlkreis: selectedWahlkreis } });
        } else {
            navigate(`${resultPrefix}/wahlkreise/${id}`, { state: { wahlkreis: selectedWahlkreis } });
        }
    }


        return (
            <>
                <WahlkreislisteC showWahlkreisDetails={showWahlkreisDetails} />
                <WahlkreisMapC openDetails={showWahlkreisDetails}></WahlkreisMapC>
            </>
        )
}