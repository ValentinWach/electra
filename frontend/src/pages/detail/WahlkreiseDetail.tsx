import { useCallback, useEffect, useState } from "react";
import {
    fetchErststimmanteileWahlkreis,
    fetchWahlkreise,
    fetchWinningPartiesWahlkreis,
    fetchWahlkreisOverview,
    fetchZweitstimmanteileWahlkreis
} from "../../apiServices.ts";
import { OverviewWahlkreis, Wahlkreis } from "../../api";
import { useElection } from "../../context/ElectionContext.tsx";
import StimmanteileC from "../../components/page-elements/_shared/StimmenanteileC.tsx";
import WinningPartiesC from "../../components/page-elements/Wahlkreise/WinningPartiesC.tsx";
import ContentTileC from "../../components/UI-element-components/ContentTileC.tsx";
import DoughnutChart from "../../components/chart-components/DoughnutChartC.tsx";
import BackBreadcrumbsC from "../../components/UI-element-components/BackBreadcrumbsC.tsx";
import ToggleSwitchC from "../../components/UI-element-components/ToggleSwitchC.tsx";
import { useCalcOnAggregate } from "../../context/CalcOnAggregateContext.tsx";
import DirektkandidatC from "../../components/page-elements/Wahlkreise/DirektkandidatC.tsx";
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ChartDataNum } from "../../models/ChartData";
import { resultPrefix } from "../../constants/PathPrefixes.ts";
import AlertC from "../../components/UI-element-components/AlertC.tsx";
import { AlertType } from "../../models/AlertData.ts";


export default function WahlkreiseDetail() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedElection } = useElection();
    const { calcOnAggregate, setCalcOnAggregate } = useCalcOnAggregate();

    const [wahlkreis, setWahlkreis] = useState<Wahlkreis | null>(location.state?.wahlkreis);
    const [overview, setOverview] = useState<OverviewWahlkreis>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!wahlkreis) {
            const getWahlkreis = async () => {
                try {
                    const data = await fetchWahlkreise();
                    const foundWahlkreis = data.find(wk => wk.id === Number(id));
                    if (!foundWahlkreis) {
                        throw new Error('Wahlkreis not found');
                    }
                    setWahlkreis(foundWahlkreis);
                } catch (error) {
                    console.error('Error fetching Wahlkreis:', error);
                    navigate('/wahlkreise');
                }
            };
            getWahlkreis();
        }
    }, [id, wahlkreis, navigate]);

    useEffect(() => {
        const getOverview = async () => {
            try {
                setLoading(true);
                const data = await fetchWahlkreisOverview(selectedElection?.id ?? 0, wahlkreis?.id ?? 1, calcOnAggregate);
                setOverview(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching Wahlkreis Overview:', error);
            }
        }
        getOverview()
    }, [selectedElection, wahlkreis, calcOnAggregate]);

    const Wahlbeteiligung = Math.round((overview?.wahlbeteiligung ?? 0) * 100) / 100;
    const NichtWaehler = Math.round((100 - (overview?.wahlbeteiligung ?? 0)) * 100) / 100;

    let wahlbeteiligungData: ChartDataNum = {
        labels: [`Wähler: ${Wahlbeteiligung}%`, `Nichtwähler: ${NichtWaehler}%`],
        datasets: [{
            data: [Wahlbeteiligung, NichtWaehler],
            backgroundColor: ['#008000', '#d3d3d3'],
            borderWidth: 0,
        }],
    };

    const wrapFetchErststimmanteileWahlkreis = useCallback(async (wahlId: number) => {
        const data = await fetchErststimmanteileWahlkreis(wahlId, wahlkreis?.id ?? 1, calcOnAggregate);
        return data;
    }, [wahlkreis, calcOnAggregate]);

    const wrapFetchZweitstimmanteileWahlkreis = useCallback(async (wahlId: number) => {
        const data = await fetchZweitstimmanteileWahlkreis(wahlId, wahlkreis?.id ?? 1);
        return data;
    }, [wahlkreis]);

        const wrapFetchWinningPartiesWahlkreis = useCallback(async (wahlId: number) => {
        const data = await fetchWinningPartiesWahlkreis(wahlId, wahlkreis?.id ?? 1);
        return data;
    }, [wahlkreis]);

    return (
        wahlkreis != null && (
            <>
                <div className="max-w-[1100px] sm:w-full xl:w-[90%] 2xl:w-3/4 flex flex-row justify-between gap-5">
                    <BackBreadcrumbsC
                        breadcrumbData={{ items: ["Wahlkreise", `Nr. ${wahlkreis.id}: ${wahlkreis.name}`] }}
                        backFunction={() => navigate(`${resultPrefix}/wahlkreise`)} />
                </div>
                <WinningPartiesC fetchWinningParties={wrapFetchWinningPartiesWahlkreis} />
                <div className="max-w-[1100px] sm:w-full xl:w-[90%] 2xl:w-3/4 flex flex-col justify-start gap-5 -mb-5">
                    <ToggleSwitchC defaultEnabled={!calcOnAggregate} setEnabledInputFunct={(calcOnEinzelstimmen: boolean) => setCalcOnAggregate(!calcOnEinzelstimmen)} label={"Ab hier auf Einzelstimmen berechnen"} />
                </div>
                <StimmanteileC fetchStimmanteileZweitstimmen={wrapFetchZweitstimmanteileWahlkreis}
                    fetchStimmanteileErststimmen={wrapFetchErststimmanteileWahlkreis}
                    showAllPartiesDefault={false} title="Stimmanteile" />
                <DirektkandidatC overview={overview} loading={loading} />
                <ContentTileC header={"Wahlbeteiligung nach Zweitstimmen"} loading={loading}>
                    <div className="flex flex-col w-2/3">

                        <AlertC alertData={{ type: AlertType.info, message: `Berechnet auf Basis der Einwohnerzahlen vom ${selectedElection?.date.getFullYear() === 2021 ? '31.12.2019' : '31.12.2015'}. Als wahlberechtigt gelten hier alle volljährigen deutschen Staatsbürger.` }} />
                    </div>
                    <DoughnutChart data={wahlbeteiligungData} fullCircle={true}></DoughnutChart>
                </ContentTileC>
            </>
        ));
}