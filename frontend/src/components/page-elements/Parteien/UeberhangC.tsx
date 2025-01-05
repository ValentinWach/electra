import {useEffect, useState} from "react";
import {Ueberhang} from "../../../api/index.ts";
import {useElection} from "../../../context/ElectionContext.tsx";
import ContentTileC from "../../UI-element-components/ContentTileC.tsx";
import './table.css';


export default function UeberhangC({fetchUeberhang}: {
    fetchUeberhang: (id: number) => Promise<Ueberhang>
}) {

    const {selectedElection} = useElection();
    const [ueberhang, setUeberhang] = useState<Ueberhang>();

    useEffect(() => {
        const getUeberhang = async () => {
            try {
                const data = await fetchUeberhang(selectedElection?.id ?? 0)
                const dataSorted = {...data, bundeslaender: data.bundeslaender?.filter(b => b.ueberhang > 0).sort((a, b) => a.ueberhang - b.ueberhang)};
                setUeberhang(dataSorted);
            } catch (error) {
                console.error('Error fetching Ueberhaenge:', error);
            }
        };
        getUeberhang();
    }, [selectedElection]);

    return (
        ueberhang?.bundeslaender?.length != null && ueberhang?.bundeslaender?.length > 0  && (
            <ContentTileC header="Überhänge">
                <table className="table">
                    <thead>
                    <tr>
                        <th scope="col">Bundesland</th>
                        <th scope="col">#Überhangsmandate</th>
                    </tr>
                    </thead>
                    <tbody>
                    {ueberhang?.bundeslaender?.map((bundeslandData) => (
                        <tr key={bundeslandData.bundesland.id}>
                            <td>{bundeslandData.bundesland.name}</td>
                            <td>{bundeslandData.ueberhang}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </ContentTileC>
        )
    )
}