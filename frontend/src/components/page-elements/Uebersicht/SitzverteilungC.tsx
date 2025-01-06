import { useEffect, useState } from 'react';
import { fetchSitzveteilung } from '../../../apiServices.ts';
import { SeatDistribution } from "../../../api/index.ts";
import ContentTileC from "../../UI-element-components/ContentTileC.tsx";
import DoughnutChart from "../../chart-components/DoughnutChartC.tsx";
import { ChartDataNum } from "../../../models/ChartData.ts";
import { useElection } from "../../../context/ElectionContext.tsx";
import { getPartyColor } from "../../../utils/utils.tsx";
import { useMinLoadingTime } from '../../../hooks/useMinLoadingTime.ts';
import GridC from '../../UI-element-components/GridC.tsx';

export default function SitzverteilungC() {
    const { selectedElection } = useElection();
    const [sitzverteilung, setSitzverteilung] = useState<SeatDistribution>();
    const [loading, setLoading] = useState(true);
    const showLoader = useMinLoadingTime(loading);

    useEffect(() => {
        const getSitzverteilung = async () => {
            try {
                const data = await fetchSitzveteilung(selectedElection?.id ?? 0);
                setSitzverteilung(data);
            } catch (error) {
                console.error('Error fetching Sitzverteilung:', error);
            }
            finally {
                setLoading(false); //It looks better when loading is only in beginning, but when changing election
            }
        };
        getSitzverteilung();
    }, [selectedElection]);

    let data: ChartDataNum = {
        labels: sitzverteilung?.distribution?.map((partei) => `${partei.party.shortname}: ${partei.seats}`) ?? [],
        datasets: [{
            data: sitzverteilung?.distribution?.map((partei) => partei.seats) ?? [],
            backgroundColor: sitzverteilung?.distribution?.map((partei) => getPartyColor(partei.party.shortname)) ?? [],
            borderWidth: 0,
        }],
    };


    return (
        <ContentTileC loading={showLoader} header={"Sitzverteilung"}>
            <DoughnutChart data={data}></DoughnutChart>
            <GridC
                gridData={{
                    columns: [
                        { id: 1, label: 'Kürzel', searchable: false },
                        { id: 2, label: 'Partei', searchable: false },
                        { id: 3, label: `Sitze (${sitzverteilung?.distribution?.reduce((sum, partei) => sum + partei.seats, 0)})`, searchable: false }
                    ],
                    rows: sitzverteilung?.distribution?.map(partei => ({
                        key: partei.party.id,
                        values: [
                            { column_id: 1, value: partei.party.shortname ?? '', badge: { color: getPartyColor(partei.party.shortname, false) } },
                            { column_id: 2, value: partei.party.name ?? '' },
                            { column_id: 3, value: partei.seats.toString() }
                        ]
                    })) ?? []
                }}
                usePagination={false}
                defaultSortColumnId={3}
                defaultSortDirection={"desc"}
            />
        </ContentTileC>
    )
}