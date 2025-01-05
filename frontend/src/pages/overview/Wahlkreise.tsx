import {useEffect, useState} from "react";
import {
    fetchStimmanteileWahlkreis,
    fetchWahlkreise,
    fetchWinningPartiesWahlkreis,
    fetchWahlkreisOverview
} from "../../apiServices.ts";
import {OverviewWahlkreis, Stimmanteil, Wahlkreis, WinningParties} from "../../api/index.ts";
import {useElection} from "../../context/ElectionContext.tsx";
import WahlkreislisteC from "../../components/page-elements/Wahlkreise/WahlkreislisteC.tsx";
import ZweitstimmenanteilC from "../../components/page-elements/_shared/ZweitstimmenanteilC.tsx";
import WinningPartiesC from "../../components/page-elements/Wahlkreise/WinningPartiesC.tsx";
import ContentTileC from "../../components/UI-element-components/ContentTileC.tsx";
import DoughnutChart from "../../components/chart-components/DoughnutChartC.tsx";
import {ChartData} from "chart.js";
import WahlkreisMapC from "../../components/page-elements/Wahlkreise/WahlkreisMapC.tsx";
import BackBreadcrumbsC from "../../components/UI-element-components/BackBreadcrumbsC.tsx";
import ToggleSwitchC from "../../components/UI-element-components/ToggleSwitchC.tsx";
import {useCalcOnAggregate} from "../../context/CalcOnAggregateContext.tsx";
import DirektkandidatC from "../../components/page-elements/Wahlkreise/DirektkandidatC.tsx";

export default function Wahlkreise() {

    const {selectedElection} = useElection();
    const { calcOnAggregate, setCalcOnAggregate } = useCalcOnAggregate()
    const [wahlkreise, setWahlkreise] = useState<Wahlkreis[]>();
    const [selectedWahlkreis, setSelectedWahlkreis] = useState<Wahlkreis | null>(null);
    const [overview, setOverview] = useState<OverviewWahlkreis>();


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

    useEffect(() => {
        const getOverview = async () => {
            try {
                const data = await fetchWahlkreisOverview(selectedElection?.id ?? 0, selectedWahlkreis?.id ?? 0, calcOnAggregate);
                setOverview(data);
            } catch (error) {
                console.error('Error fetching Wahlkreis Overview:', error);
            }
        }
        getOverview()
    }, [selectedElection, selectedWahlkreis, calcOnAggregate]);

    const Wahlbeteiligung = Math.round((overview?.wahlbeteiligung ?? 0) * 100) / 100;
    const NichtWaehler = Math.round((100 - (overview?.wahlbeteiligung ?? 0)) * 100) / 100;
    console.log(Wahlbeteiligung);
    
    let wahlbeteiligungData: ChartData = {
        labels: [`Wähler: ${Wahlbeteiligung}%`, `Nichtwähler: ${NichtWaehler}%`],
        datasets: [{
            data: [Wahlbeteiligung, NichtWaehler],
            backgroundColor: ['#008000', '#d3d3d3'],
            borderWidth: 0,
        },],
    };

    const showWahlkreisDetails = (id: number) => {
        setSelectedWahlkreis(wahlkreise?.find(wahlkreis => wahlkreis.id === id) ?? null);
    }

    async function wrapFetchStimmanteileWahlkreis(wahlId: number): Promise<Stimmanteil[]> {
        return fetchStimmanteileWahlkreis(wahlId, selectedWahlkreis?.id ?? 0, calcOnAggregate);
    }

    async function wrapFetchWinningPartiesWahlkreis(wahlId: number): Promise<WinningParties> {
        return fetchWinningPartiesWahlkreis(wahlId, selectedWahlkreis?.id ?? 0);
    }

    return (
        <div className={"flex flex-col items-center"}>
            {
                selectedWahlkreis ?
                    <div className="w-chart-lg max-lg:w-char flex flex-row justify-between gap-5">
                        <BackBreadcrumbsC
                            breadcrumbData={{items: ["Wahlkreise", `Nr. ${selectedWahlkreis.id}: ${selectedWahlkreis.name}`]}}
                            backFunction={() => (setSelectedWahlkreis(null))}/>
                    </div>
                    :
                    <>
                        <WahlkreislisteC showWahlkreisDetails={showWahlkreisDetails}/>
                        <WahlkreisMapC openDetails={showWahlkreisDetails}></WahlkreisMapC>
                    </>
            }
            {
                selectedWahlkreis ?
                    <>
                        <WinningPartiesC fetchWinningParties={wrapFetchWinningPartiesWahlkreis}/>
                        <div className="w-chart-lg max-lg:w-char flex flex-col justify-start gap-5 -mb-5">
                            <ToggleSwitchC defaultEnabled={!calcOnAggregate} setEnabledPar={(calcOnEinzelstimmen: boolean) => setCalcOnAggregate(!calcOnEinzelstimmen)} label={"Ab hier auf Einzelstimmen berechnen"}/>
                        </div>
                        <ZweitstimmenanteilC fetchStimmanteile={wrapFetchStimmanteileWahlkreis}
                                             showAbsoluteVotesDefault={true}/>
                        <DirektkandidatC overview={overview} />
                        <ContentTileC header={"Wahlbeteiligung"}>
                            <DoughnutChart data={wahlbeteiligungData} fullCircle={true}></DoughnutChart>
                        </ContentTileC>
                    </>
                    :
                    null
            }
        </div>
    )
}