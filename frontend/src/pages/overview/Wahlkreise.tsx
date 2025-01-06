import { useCallback, useEffect, useState } from "react";
import {
    fetchStimmanteileWahlkreis,
    fetchWahlkreise,
    fetchWinningPartiesWahlkreis,
    fetchWahlkreisOverview
} from "../../apiServices.ts";
import { OverviewWahlkreis, Stimmanteil, Wahlkreis, WinningParties } from "../../api/index.ts";
import { useElection } from "../../context/ElectionContext.tsx";
import WahlkreislisteC from "../../components/page-elements/Wahlkreise/WahlkreislisteC.tsx";
import ZweitstimmenanteilC from "../../components/page-elements/_shared/ZweitstimmenanteilC.tsx";
import WinningPartiesC from "../../components/page-elements/Wahlkreise/WinningPartiesC.tsx";
import ContentTileC from "../../components/UI-element-components/ContentTileC.tsx";
import DoughnutChart from "../../components/chart-components/DoughnutChartC.tsx";
import { ChartData } from "chart.js";
import WahlkreisMapC from "../../components/page-elements/Wahlkreise/WahlkreisMapC.tsx";
import BackBreadcrumbsC from "../../components/UI-element-components/BackBreadcrumbsC.tsx";
import ToggleSwitchC from "../../components/UI-element-components/ToggleSwitchC.tsx";
import { useCalcOnAggregate } from "../../context/CalcOnAggregateContext.tsx";
import DirektkandidatC from "../../components/page-elements/Wahlkreise/DirektkandidatC.tsx";
import { useNavigate } from 'react-router-dom';

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
            navigate(`/wahlkreise/${id}`, { state: { wahlkreis: selectedWahlkreis } });
        } else {
            navigate(`/wahlkreise/${id}`, { state: { wahlkreis: selectedWahlkreis } });
        }
    }


        return (
            <div className={"flex flex-col items-center"}>
                <WahlkreislisteC showWahlkreisDetails={showWahlkreisDetails} />
                <WahlkreisMapC openDetails={showWahlkreisDetails}></WahlkreisMapC>
            </div>
        )
}