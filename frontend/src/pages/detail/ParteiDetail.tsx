import { useCallback, useEffect, useState } from "react";
import {
    fetchClosestWinners,
    fetchParteien,
    fetchUeberhangProBundesland
} from "../../apiServices.ts";
import { Partei } from "../../api";
import { useElection } from "../../context/ElectionContext.tsx";
import BackBreadcrumbsC from "../../components/UI-element-components/BackBreadcrumbsC.tsx";
import ClosestWinnersC from "../../components/page-elements/Parteien/ClosestWinnersC.tsx";
import UeberhangC from "../../components/page-elements/Parteien/UeberhangC.tsx";
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { resultPrefix } from "../../constants/PathPrefixes.ts";


export default function ParteiDetail() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedElection } = useElection();
    
    const [partei, setPartei] = useState<Partei | null>(location.state?.partei);

    useEffect(() => {
        if (!partei) {
            const getPartei = async () => {
                try {
                    const data = await fetchParteien(selectedElection?.id ?? 0);
                    const foundPartei = data.find(p => p.id === Number(id));
                    if (!foundPartei) {
                        throw new Error('Partei not found');
                    }
                    setPartei(foundPartei);
                } catch (error) {
                    console.error('Error fetching Partei:', error);
                    navigate('/parteien');
                }
            };
            getPartei();
        }
    }, [id, partei, navigate, selectedElection]);

    const wrapFetchClosestWinners = useCallback(async (wahlId: number) => {
        const data = await fetchClosestWinners(wahlId, partei?.id ?? 0);
        return data;
    }, [partei]);

    const wrapFetchUeberhang = useCallback(async (wahlId: number) => {
        const data = await fetchUeberhangProBundesland(wahlId, partei?.id ?? 0);
        return data;
    }, [partei]);

    return (
        partei != null && (
            <>
                <div className="max-w-[1300px] sm:w-full xl:w-[90%] 2xl:w-3/4 flex flex-row justify-between gap-5">
                    <BackBreadcrumbsC
                        breadcrumbData={{
                            items: ["Parteien", partei.name ? (`${partei.name} (${partei.shortname})`) : partei.shortname]
                        }}
                        backFunction={() => navigate(`${resultPrefix}/parteien`)}
                    />
                </div>
                <ClosestWinnersC fetchClostestWinners={wrapFetchClosestWinners}/>
                <UeberhangC fetchUeberhang={wrapFetchUeberhang}></UeberhangC>
            </>
        )
    );
}
