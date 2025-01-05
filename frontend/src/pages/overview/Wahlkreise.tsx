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
import {getPartyColor} from "../../utils/utils.tsx";
import ContentTileC from "../../components/UI-element-components/ContentTileC.tsx";
import DoughnutChart from "../../components/chart-components/DoughnutChartC.tsx";
import {ChartData} from "chart.js";
import WahlkreisMapC from "../../components/page-elements/Wahlkreise/WahlkreisMapC.tsx";
import BackBreadcrumbsC from "../../components/UI-element-components/BackBreadcrumbsC.tsx";
import ToggleSwitchC from "../../components/UI-element-components/ToggleSwitchC.tsx";
import {useCalcOnAggregate} from "../../context/CalcOnAggregateContext.tsx";

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

    const nichtWaehler = Math.round((100 - overview?.wahlbeteiligung) * 10) / 10;
    let wahlbeteiligungData: ChartData = {
        labels: [`Wähler: ${overview?.wahlbeteiligung}%`, `Nichtwähler: ${nichtWaehler}%`],
        datasets: [{
            data: [overview?.wahlbeteiligung, nichtWaehler],
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
        return fetchWinningPartiesWahlkreis(wahlId, selectedWahlkreis?.id ?? 0); //TODO: useEinzelstimmen
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
                        <div className="w-chart-lg max-lg:w-char flex flex-row justify-between -mb-5">
                            <ToggleSwitchC defaultEnabled={!calcOnAggregate} setEnabledPar={(calcOnEinzelstimmen: boolean) => setCalcOnAggregate(!calcOnEinzelstimmen)} label={"Ab hier auf Einzelstimmen berechnen"}/>
                        </div>
                        <ZweitstimmenanteilC fetchStimmanteile={wrapFetchStimmanteileWahlkreis}
                                             showAbsoluteVotes={true}/>
                        <ContentTileC header={"Direktkandidat"}>
                            <table className="table">
                                <thead>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">Vorname</th>
                                    <th scope="col">Geburtsjahr</th>
                                    <th scope="col">Beruf</th>
                                    <th scope="col">Partei</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr key={overview?.direktkandidat?.id}>
                                    <td>{overview?.direktkandidat?.name}</td>
                                    <td>{overview?.direktkandidat?.firstname}</td>
                                    <td>{overview?.direktkandidat?.yearOfBirth}</td>
                                    <td>{overview?.direktkandidat?.profession}</td>
                                    <td style={{color: getPartyColor(overview?.direktkandidat.party.shortname)}}>
                                        {overview?.direktkandidat.party.shortname}
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </ContentTileC>
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