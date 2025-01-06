import {useEffect, useState} from 'react';
import {Stimmanteil, Wahl} from "../../../api/index.ts";
import ContentTileC from "../../UI-element-components/ContentTileC.tsx";
import {useElection} from "../../../context/ElectionContext.tsx";
import {getPartyColor} from "../../../utils/utils.tsx";
import BarchartC from "../../chart-components/BarchartC.tsx";
import type {DropdownData} from "../../../models/DropDownData.ts";
import { useBundestagsParteien } from '../../../hooks/useBundestagsParteien.ts';
import GridC from '../../UI-element-components/GridC.tsx';
import CheckboxC from '../../UI-element-components/CheckboxC.tsx';
import type { ChartDataNum } from '../../../models/ChartData';
import { useMinLoadingTime } from '../../../hooks/useMinLoadingTime.ts';

export default function ZweitstimmenanteilC({fetchStimmanteile, showAbsoluteVotesDefault = false}: {
    fetchStimmanteile: (wahlId: number) => Promise<Stimmanteil[]>,
    showAbsoluteVotesDefault?: boolean
}) {
    const {elections, selectedElection} = useElection();
    const [stimmanteil, setStimmanteil] = useState<Stimmanteil[]>();
    const [comparedStimmanteil, setComparedStimmanteil] = useState<Stimmanteil[]>()
    const [comparedElection, setComparedElection] = useState<Wahl | null>()
    const [summarizeOtherParties, setSummarizeOtherParties] = useState(true);
    const [showAbsoluteVotes, setShowAbsoluteVotes] = useState(showAbsoluteVotesDefault);
    const [loading, setLoading] = useState(true);
    const { parteien: Bundestagsparteien } = useBundestagsParteien();
    const showLoader = useMinLoadingTime(loading);

    const processStimmanteile = (data: Stimmanteil[] | undefined) => {
        if (!data) return [];
        data = data.sort((a, b) => a.party.shortname.localeCompare(b.party.shortname));
        if (!summarizeOtherParties) return data;

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
            share: Math.round(sonstigeShare * 10) / 10,
            absolute: sonstigeAbsolute
        }];
    };

    useEffect(() => {
        const getStimmanteile = async () => {
            try {
                setLoading(true);
                const data = await fetchStimmanteile(selectedElection?.id ?? 0);
                setComparedElection(null);
                setStimmanteil(data);
            } catch (error) {
                console.error('Error fetching Sitzverteilung:', error);
            } finally {
                setLoading(false);
            }
        };
        getStimmanteile();
    }, [selectedElection, fetchStimmanteile]); //fetchStimmanteile could be changed depending on the use of aggregate or not

    const compareWahlDD: DropdownData = {
        items: [{label: "Nicht vergleichen", id: -1},
            ...elections.filter(e => e.id != selectedElection?.id).map(election => ({
                label: "vgl: " + election.date.toLocaleDateString('de-DE', {month: 'long', year: 'numeric'}),
                id: election.id
            }))],
        defaultChosenId: -1,
    };

    async function compareStimmanteile(wahlId: number) {
        if (wahlId < 1) {
            setComparedElection(null);
        } else {
            try {
                const comparedData = await fetchStimmanteile(wahlId);
                const comparedMap = new Map(comparedData.map(item => [item.party.id, item]));
                const stimmanteilWithDifference = stimmanteil?.map(item => {
                    const comparedItem = comparedMap.get(item.party.id) || {share: 0, absolute: 0};
                    const shareDifference = Math.round((comparedItem.share - item.share) * 10) / 10;
                    const absoluteDifference = comparedItem.absolute - item.absolute;
                    return {
                        ...item,
                        share: shareDifference,
                        absolute: absoluteDifference
                    };
                }) || [];
                setComparedStimmanteil(stimmanteilWithDifference);
                setComparedElection(elections.find(e => e.id === wahlId) ?? elections[0]);

            } catch (error) {
                console.error('Error fetching Sitzverteilung:', error);
            }
        }
    }

    let mainData: ChartDataNum = {
        labels: processStimmanteile(stimmanteil).map((partei) => 
            `${partei.party.shortname}: ${partei.share}%`
        ),
        datasets: [{
            data: processStimmanteile(stimmanteil).map((partei) => partei.share),
            backgroundColor: processStimmanteile(stimmanteil).map((partei) => 
                partei.party.shortname === "Sonstige" ? "#808080" : getPartyColor(partei.party.shortname, true)
            ),
            borderWidth: 0,
        }],
    };

    let comparedData: ChartDataNum = {
        labels: processStimmanteile(comparedStimmanteil).map((partei) => 
            `${partei.party.shortname}: ${partei.share > 0 ? '+' : ''}${partei.share}%`
        ),
        datasets: [{
            data: processStimmanteile(comparedStimmanteil).map((partei) => partei.share),
            backgroundColor: processStimmanteile(comparedStimmanteil).map((partei) => 
                partei.party.shortname === "Sonstige" ? "#808080" : getPartyColor(partei.party.shortname, true)
            ),
            borderWidth: 0,
        }],
    };
    
    return (
        <div className={"flex-grow"}>
            <ContentTileC loading={showLoader} dropDownContent={compareWahlDD} dropDownFunction={compareStimmanteile} header={"Zweitstimmenanteile"}>
                {comparedElection ?
                    <BarchartC data={comparedData}></BarchartC>
                    :
                    <BarchartC data={mainData}></BarchartC>}
                <div className={"flex flex-row justify-start w-full gap-5"}>
                    <CheckboxC setEnabledInputFunct={setSummarizeOtherParties} label={"Sonstige Zusammenfassen"} defaultChecked={true}/>
                    <CheckboxC setEnabledInputFunct={setShowAbsoluteVotes} label={"Absolute Stimmen anzeigen"} defaultChecked={showAbsoluteVotesDefault}/>
                </div>
                {showAbsoluteVotes ?
                    <GridC
                        gridData={{
                            columns: [
                                {id: 1, label: 'Kürzel', searchable: true},
                                {id: 2, label: 'Partei', searchable: true}, 
                                {id: 3, label: comparedElection ? "Differenz zum Vergleichszeitraum" : "Anzahl Zweitstimmen", searchable: false}
                            ],
                            rows: processStimmanteile(stimmanteil).map(partei => {
                                const comparedValue = processStimmanteile(comparedStimmanteil).find(p => p.party.id === partei.party.id)?.absolute ?? 0;
                                const comparedValueStr = !comparedElection ? 
                                    partei.absolute.toString() :
                                    `${comparedValue > 0 ? '+' : ''}${comparedValue}`;
                                    
                                return {
                                    key: partei.party.id,
                                    values: [
                                        {column_id: 1, value: partei.party.shortname || '', badge: {color: getPartyColor(partei.party.shortname || '')}},
                                        {column_id: 2, value: partei.party.name || ''},
                                        {column_id: 3, value: comparedValueStr}
                                    ]
                                };
                            })
                        }}
                        defaultSortColumnId={3}
                        defaultSortDirection={'desc'}
                        usePagination={!summarizeOtherParties}
                    />
                    :
                    null
                }
            </ContentTileC>
        </div>
    )
}