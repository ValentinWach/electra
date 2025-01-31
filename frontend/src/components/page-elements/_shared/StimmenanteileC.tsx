import { useEffect, useState } from 'react';
import { Stimmanteil, Wahl } from "../../../api/index.ts";
import ContentTileC from "../../UI-element-components/ContentTileC.tsx";
import { useElection } from "../../../context/ElectionContext.tsx";
import { getPartyColor } from "../../../utils/GetPartyColor.tsx";
import BarchartC from "../../chart-components/BarchartC.tsx";
import type { DropdownData } from "../../../models/DropDownData.ts";
import { useBundestagsParteien } from '../../../hooks/useBundestagsParteien.ts';
import GridC from '../../UI-element-components/GridC.tsx';
import CheckboxC from '../../UI-element-components/CheckboxC.tsx';
import type { ChartDataNum } from '../../../models/ChartData.ts';
import { useMinLoadingTime } from '../../../hooks/useMinLoadingTime.ts';
import { formatNumberWithSpaces } from "../../../utils/FormatNumber.tsx";
import RadioC from '../../UI-element-components/RadioC.tsx';

export default function StimmanteileC({ fetchStimmanteileZweitstimmen, fetchStimmanteileErststimmen, showAllPartiesDefault = false, title }: {
    fetchStimmanteileZweitstimmen: (wahlId: number) => Promise<Stimmanteil[]>,
    fetchStimmanteileErststimmen: (wahlId: number) => Promise<Stimmanteil[]>,
    showAllPartiesDefault?: boolean,
    title: string

}) {
    const { elections, selectedElection } = useElection();
    const [stimmanteil, setStimmanteil] = useState<Stimmanteil[]>();
    const [comparedStimmanteil, setComparedStimmanteil] = useState<Stimmanteil[]>()
    const [comparedElection, setComparedElection] = useState<Wahl | null>()
    const [showAllParties, setShowAllParties] = useState(showAllPartiesDefault);
    const [showAbsoluteVotes, setShowAbsoluteVotes] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showZweitstimmen, setShowZweitstimmen] = useState(true);

    const { parteien: Bundestagsparteien } = useBundestagsParteien();
    const showLoader = useMinLoadingTime(loading);

    const processStimmanteile = (data: Stimmanteil[] | undefined, summarizeOtherPartiesPar: boolean) => {
        if (!data) return [];
        data = data.sort((a, b) => a.party.shortname.localeCompare(b.party.shortname));
        if (!summarizeOtherPartiesPar) return data;

        const bundestagsParties = data.filter(s => 
            Bundestagsparteien.some(bp => bp.id === s.party.id)
        );

        const otherParties = data.filter(s => 
            !Bundestagsparteien.some(bp => bp.id === s.party.id)
        );

        const sonstigeShare = otherParties.reduce((sum, party) => sum + party.share, 0);
        const sonstigeAbsolute = otherParties.reduce((sum, party) => sum + party.absolute, 0);

        return [...bundestagsParties, {
            party: {
                id: -1,
                name: "Sonstige Parteien",
                shortname: "Sonstige"
            },
            share: Math.round(sonstigeShare * 100) / 100,
            absolute: sonstigeAbsolute
        }];
    };


    useEffect(() => {
        const getStimmanteile = async () => {
            try {
                const data = showZweitstimmen ? await fetchStimmanteileZweitstimmen(selectedElection?.id ?? 0) : await fetchStimmanteileErststimmen(selectedElection?.id ?? 0);
                setComparedElection(null);
                setStimmanteil(data);
            } catch (error) {
                console.error('Error fetching Sitzverteilung:', error);
            }
            finally {
                setLoading(false);
            }
        };
        getStimmanteile();

    }, [selectedElection]);

    useEffect(() => {
        const getStimmanteile = async () => {
            try {
                const data = showZweitstimmen ? await fetchStimmanteileZweitstimmen(selectedElection?.id ?? 0) : await fetchStimmanteileErststimmen(selectedElection?.id ?? 0);
                setStimmanteil(data);
                if (comparedElection) {
                    compareStimmanteile(comparedElection.id);
                }
            } catch (error) {
                console.error('Error fetching Sitzverteilung:', error);
            }
            finally {
                setLoading(false);
            }
        };
        getStimmanteile();
    }, [showZweitstimmen]);

    const compareWahlDD: DropdownData = {
        items: [{ label: "Nicht vergleichen", id: -1 },
        ...elections.filter(e => e.id != selectedElection?.id).map(election => ({
            label: "Vgl: " + election.date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }),
            id: election.id
        }))],
        defaultChosenId: -1,
    };

    async function compareStimmanteile(wahlId: number) {
        if (wahlId < 1) {
            setComparedElection(null);
        } else {
            try {
                const comparedData = showZweitstimmen ? await fetchStimmanteileZweitstimmen(wahlId) : await fetchStimmanteileErststimmen(wahlId);
                const comparedMap = new Map(comparedData.map(item => [item.party.id, item]));
                const stimmanteilWithDifference = stimmanteil?.map(item => {

                    const comparedItem = comparedMap.get(item.party.id) || { share: 0, absolute: 0 };
                    const shareDifference = Math.round((item.share - comparedItem.share) * 100) / 100;
                    const absoluteDifference = item.absolute - comparedItem.absolute;
                    return {
                        ...item,
                        share: shareDifference,
                        absolute: absoluteDifference
                    };
                }) || [];
                console.log(stimmanteilWithDifference);
                setComparedStimmanteil(stimmanteilWithDifference);
                setComparedElection(elections.find(e => e.id === wahlId) ?? elections[0]);

            } catch (error) {
                console.error('Error fetching Sitzverteilung:', error);
            }
        }
    }

    let mainData: ChartDataNum = {
        labels: processStimmanteile(stimmanteil, true).map((partei) =>
            `${partei.party.shortname}: ${showAbsoluteVotes ? formatNumberWithSpaces(partei.absolute) : partei.share + '%'}`
        ),
        datasets: [{
            data: processStimmanteile(stimmanteil, true).map((partei) => 
                showAbsoluteVotes ? partei.absolute : partei.share
            ),
            backgroundColor: processStimmanteile(stimmanteil, true).map((partei) =>
                partei.party.shortname === "Sonstige" ? "#808080" : getPartyColor(partei.party.shortname, true)
            ),
            borderWidth: 0,
        }],
    };

    let comparedData: ChartDataNum = {
        labels: processStimmanteile(comparedStimmanteil, true).map((partei) => {
            const value = showAbsoluteVotes ? partei.absolute : partei.share;
            return `${partei.party.shortname}: ${value > 0 ? '+' : ''}${showAbsoluteVotes ? formatNumberWithSpaces(value) : value + '%'}`;
        }),
        datasets: [{
            data: processStimmanteile(comparedStimmanteil, true).map((partei) => 
                showAbsoluteVotes ? partei.absolute : partei.share
            ),
            backgroundColor: processStimmanteile(comparedStimmanteil, true).map((partei) =>
                partei.party.shortname === "Sonstige" ? "#808080" : getPartyColor(partei.party.shortname, true)
            ),
            borderWidth: 0,
        }],
    };

    const handleZweitstimmenChange = (id: string) => {
        if (id === "zs") {
            setShowZweitstimmen(true);
        } else {
            setShowZweitstimmen(false);
        }
    };

    return (
        <ContentTileC loading={showLoader} dropDownContent={compareWahlDD} dropDownFunction={compareStimmanteile} header={title}>
            {comparedElection ?
                <BarchartC data={comparedData}></BarchartC>
                :
                <BarchartC data={mainData}></BarchartC>}
            <div className={"flex mb-3 -mt-5 flex-row justify-center w-full gap-3"}>
                <RadioC radioData={[
                    { id: 'es', title: 'Erststimmen' },
                    { id: 'zs', title: 'Zweitstimmen' },
                ]} defaultCheckedId={showZweitstimmen ? "zs" : "es"} changeFunction={handleZweitstimmenChange} />
            </div>
            <div className={"flex flex-row justify-start w-full gap-5"}>
                <CheckboxC setEnabledInputFunct={setShowAllParties} label={"Alle Parteien Anzeigen"} defaultChecked={showAllPartiesDefault} />
                <CheckboxC setEnabledInputFunct={setShowAbsoluteVotes} label={"Absolute Stimmen anzeigen"} defaultChecked={showAbsoluteVotes} />
            </div>
            {showAllParties ?
                <GridC
                    gridData={{
                        columns: [
                            { id: 1, label: 'Kürzel', searchable: true },
                            { id: 2, label: 'Partei', searchable: true },
                            { id: 3, label: showAbsoluteVotes ? "Anzahl Stimmen" : "Stimmenanteil (%)", searchable: false },
                            ...(comparedElection != null ? [{ id: 4, label: "Differenz zum Vergleichszeitraum", searchable: false }] : [])
                        ],
                        rows: processStimmanteile(stimmanteil, false).map(partei => {
                            const comparedValue = processStimmanteile(comparedStimmanteil, false).find(p => p.party.id === partei.party.id)?.[showAbsoluteVotes ? 'absolute' : 'share'] ?? 0;
                            const comparedValueStr = comparedElection != null ?
                                `${comparedValue >= 0 ? '+' : ''}${showAbsoluteVotes ? formatNumberWithSpaces(comparedValue) : comparedValue + '%'}` : "";

                            return {
                                key: partei.party.id,
                                values: [
                                    { column_id: 1, value: partei.party.shortname || '', badge: { color: getPartyColor(partei.party.shortname || '') } },
                                    { column_id: 2, value: partei.party.name || '' },
                                    { column_id: 3, value: showAbsoluteVotes ? formatNumberWithSpaces(partei.absolute) : partei.share + '%' },
                                    ...(comparedElection ? [{ column_id: 4, value: comparedValueStr}] : [])
                                ]
                            };
                        })
                    }}
                    defaultSortColumnId={3}
                    defaultSortDirection={'desc'}
                    usePagination={true}
                />
                :
                null
            }
        </ContentTileC>
    )
}