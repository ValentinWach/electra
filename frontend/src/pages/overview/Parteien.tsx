import {useEffect, useState} from "react";
import {fetchClosestWinners, fetchParteien, fetchSitzveteilung, fetchUeberhangProBundesland} from "../../apiServices.ts";
import {ClosestWinners, Partei, Ueberhang} from "../../api/index.ts";
import {useElection} from "../../context/ElectionContext.tsx";
import ClosestWinnersC from "../../components/page-elements/Parteien/ClosestWinnersC.tsx";
import BackBreadcrumbsC from "../../components/UI-element-components/BackBreadcrumbsC.tsx";
import UeberhangC from "../../components/page-elements/Parteien/UeberhangC.tsx";
import BundestagsparteienC from "../../components/page-elements/Parteien/BundestagsparteienC.tsx";
import AngetreteneParteienC from "../../components/page-elements/Parteien/AngetreteneParteienC.tsx";

export default function Parteien() {

    const {selectedElection} = useElection();
    const [alleParteien, setAlleParteien] = useState<Partei[]>();
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
                        <BundestagsparteienC showParteiDetails={showParteiDetails}/>
                        <AngetreteneParteienC/>
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