import {useEffect, useState} from "react";
import {fetchParteien} from "../../apiServices.ts";
import {Partei} from "../../api/index.ts";
import {useElection} from "../../context/ElectionContext.tsx";
import BundestagsparteienC from "../../components/page-elements/Parteien/BundestagsparteienC.tsx";
import AngetreteneParteienC from "../../components/page-elements/Parteien/AngetreteneParteienC.tsx";
import { useNavigate } from 'react-router-dom';

export default function Parteien() {
    const {selectedElection} = useElection();
    const [alleParteien, setAlleParteien] = useState<Partei[]>();
    const navigate = useNavigate();

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
        const selectedPartei = alleParteien?.find(partei => partei.id === id);
        if (selectedPartei) {
            navigate(`/parteien/${id}`, { state: { partei: selectedPartei } });
        } else {
            navigate(`/parteien/${id}`, { state: { partei: null } });
        }
    }

    return (
        <div className={"flex flex-col items-center"}>
            <BundestagsparteienC showParteiDetails={showParteiDetails}/>
            <AngetreteneParteienC/>
        </div>
    )
}