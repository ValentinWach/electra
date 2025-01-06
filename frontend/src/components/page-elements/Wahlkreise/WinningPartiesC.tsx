import type {WinningParties} from "../../../api/index.ts";
import {getPartyColor} from "../../../utils/utils.tsx";
import {useElection} from "../../../context/ElectionContext.tsx";
import {useEffect, useState} from "react";
import GridC from "../../UI-element-components/GridC.tsx";
import {GridData, ContentTileConfig} from "../../../models/GridData.ts";
import { useMinLoadingTime } from "../../../hooks/useMinLoadingTime.ts";

export default function WinningPartiesC({fetchWinningParties}: {
    fetchWinningParties: (wahlId: number) => Promise<WinningParties>
}) {
    const {selectedElection} = useElection();
    const [winningParties, setWinningParties] = useState<WinningParties>()
    const [loading, setLoading] = useState(true);
    const showLoader = useMinLoadingTime(loading);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const winningParties = await fetchWinningParties(selectedElection?.id ?? 0);
                setWinningParties(winningParties);
            } catch (error) {
                console.error('Error fetching winning parties:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedElection]);

    return (
        <GridC
            gridData={{
                columns: [
                    {id: 1, label: 'Stimmenart', searchable: false},
                    {id: 2, label: 'Kürzel', searchable: false},
                    {id: 3, label: 'Parteiname', searchable: false}
                ],
                rows: winningParties ? [
                    {
                        key: 1,
                        values: [
                            {column_id: 1, value: 'Erststimmen'},
                            {column_id: 2, value: winningParties.erststimme[0].party.shortname ?? '', badge: {color: getPartyColor(winningParties.erststimme[0].party.shortname ?? '', true)}},
                            {
                                column_id: 3, 
                                value: winningParties.erststimme[0].party.name ?? '',
                            }
                        ]
                    },
                    {
                        key: 2,
                        values: [
                            {column_id: 1, value: 'Zweitstimmen'},
                            {column_id: 2, value: winningParties.zweitstimme[0].party.shortname ?? '', badge: {color: getPartyColor(winningParties.zweitstimme[0].party.shortname ?? '', true)}},
                            {
                                column_id: 3,
                                value: winningParties.zweitstimme[0].party.name ?? '',
                            }
                        ]
                    }
                ] : []
            }}
            usePagination={false}
            contentTileConfig={new ContentTileConfig("Siegerparteien", false)}
            loading={showLoader}
        />
    );
}