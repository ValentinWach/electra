import {useEffect, useState} from "react";
import {fetchClosestWinners, fetchParteien, fetchSitzveteilung, fetchUeberhangProBundesland} from "../../apiServices.ts";
import {ClosestWinners, Partei, Ueberhang} from "../../api/index.ts";
import {useElection} from "../../context/ElectionContext.tsx";
import ClosestWinnersC from "../../components/page-elements/Parteien/ClosestWinnersC.tsx";
import GridC from "../../components/UI-element-components/GridC.tsx";
import BackBreadcrumbsC from "../../components/UI-element-components/BackBreadcrumbsC.tsx";
import UeberhangC from "../../components/page-elements/Parteien/UeberhangC.tsx";

export default function Parteien() {

    const {selectedElection} = useElection();
    const [alleParteien, setAlleParteien] = useState<Partei[]>();
    const [eingezogeneParteien, setEingezogeneParteien] = useState<Partei[]>();
    const [selectedPartei, setSelectedPartei] = useState<Partei | null>(null);

    useEffect(() => {
        const getAlleParteien = async () => {
            try {
                const data = await fetchParteien(selectedElection?.id ?? 0);
                setAlleParteien(data);
            } catch (error) {
                console.error('Error fetching Parteien:', error);
            }
        };
        getAlleParteien();
    }, [selectedElection]);

    useEffect(() => {
        const getEingezogeneParteien = async () => {
            try {
                const data = await fetchSitzveteilung(selectedElection?.id ?? 0);
                setEingezogeneParteien(data.distribution.map(d => d.party));
            } catch (error) {
                console.error('Error fetching Parteien:', error);
            }
        };
        getEingezogeneParteien();
    }, [selectedElection]);

    const showParteiDetails = (id: number) => {
        setSelectedPartei(alleParteien?.find(partei => partei.id === id) ?? null);
    }

    async function fetchClosestWinnersWrapper(wahlId: number): Promise<ClosestWinners> {
        return fetchClosestWinners(wahlId, selectedPartei?.id ?? 0);
    }

    async function fetchUeberhangWrapper(wahlId: number): Promise<Ueberhang> {
        return fetchUeberhangProBundesland(wahlId, selectedPartei?.id ?? 0);
    }

    return (
        <div className={"flex flex-col items-center"}>
            {
                selectedPartei ?
                    <div className="w-chart-xl max-lg:w-char flex justify-start">
                        <BackBreadcrumbsC breadcrumbData={{
                            items: ["Parteien", selectedPartei.name ? (`${selectedPartei.name} (${selectedPartei.shortname})`) :
                                selectedPartei.shortname]
                        }} backFunction={() => setSelectedPartei(null)}/>
                    </div>
                    :
                    <>
                        <GridC
                            gridData={{
                                columns: [
                                    {id: 1, label: 'Name', searchable: false},
                                    {id: 2, label: 'Kurzname', searchable: false}
                                ],
                                rows: eingezogeneParteien?.map(partei => ({
                                    key: partei.id,
                                    values: [
                                        {column_id: 1, value: partei.name},
                                        {column_id: 2, value: partei.shortname}
                                    ]
                                })) ?? []
                            }}
                            header={"Bundestagsparteien"}
                            usePagination={false}
                            onRowClick={(id) => showParteiDetails(id)}
                            pageSize={10}
                        />
                        <GridC
                            gridData={{
                                columns: [
                                    {id: 1, label: 'Name', searchable: true},
                                    {id: 2, label: 'Kurzname', searchable: true}
                                ],
                                rows: alleParteien?.map(partei => ({
                                    key: partei.id,
                                    values: [
                                        {column_id: 1, value: partei.name},
                                        {column_id: 2, value: partei.shortname}
                                    ]
                                })) ?? []
                            }}
                            header={"Angetretene Parteien"}
                            usePagination={true}
                            pageSize={10}
                        />
                    </>

            }
            {
                selectedPartei ?
                    <>
                        <ClosestWinnersC fetchClostestWinners={fetchClosestWinnersWrapper}/>
                        <UeberhangC fetchUeberhang={fetchUeberhangWrapper}></UeberhangC>
                    </>
                    :
                    null
            }
        </div>
    )
}