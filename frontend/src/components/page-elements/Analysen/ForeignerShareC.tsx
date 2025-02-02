import BubbleChartC from '../../chart-components/BubbleChartC.tsx';
import ChartTile from '../../UI-element-components/ContentTileC.tsx';
import {DropdownData} from "../../../models/DropDownData.ts";
import {Partei} from "../../../api/index.ts";
import {useEffect, useState} from 'react';
import {fetchForeignerShareAnalysis} from "../../../apiServices.ts";
import {useElection} from "../../../context/ElectionContext.tsx";
import {ChartDataXYR} from "../../../models/ChartData.ts";
import {getPartyColor} from "../../../utils/GetPartyColor.tsx";

export default function ForeignerShareC({parteien} : {parteien: Partei[]}) {
    const {selectedElection} = useElection();
    const [selectedParteiId, setSelectedParteiId] = useState<number | null>(null);
    const [foreignersData, setForeignersData] = useState<ChartDataXYR>();

    useEffect(() => {
        if (parteien.length > 0) {
            setSelectedParteiId(parteien[0].id);
        }
    }, [parteien]);

    useEffect(() => {
        async function fetchForeignersData() {
            try {
                if (selectedParteiId === null) return;
                const data = await fetchForeignerShareAnalysis(selectedElection?.id ?? 0, selectedParteiId ?? 0);
                const filteredData = data.wahlkreise.filter(w => w.stimmanteil !== undefined);
                const sortedData = { ...data, wahlkreise: filteredData.sort((a, b) => a.auslaenderanteil - b.auslaenderanteil)};
                const foreignersData: ChartDataXYR = {
                    labels: sortedData.wahlkreise.map(w => `WK ${w.wahlkreisId}: ${w.wahlkreisName}`),
                    datasets: [{
                        data: sortedData.wahlkreise
                            .map(w => ({x: w.auslaenderanteil, y: w.stimmanteil!, r: 2.5})),
                        backgroundColor: [getPartyColor(parteien.find(p => p.id === selectedParteiId)?.shortname ?? '')],
                    }]
                }
                setForeignersData(foreignersData);
            }
            catch (error) {
                console.error('Error fetching Foreigners Data:', error);
            }
        }
        fetchForeignersData();
    }, [selectedParteiId, selectedElection, parteien]);

    const dropdownData: DropdownData = {
        label: undefined,
        defaultChosenId: parteien[0]?.id ?? 0,
        items: parteien.filter(p => p.shortname != "SSW").map((partei: Partei) => ({label: partei.shortname, id: partei.id})),
    }

    return (
        <ChartTile dropDownContent={dropdownData} dropDownFunction={setSelectedParteiId} header={"Ergebnisse nach Ausländeranteil"}>
            <BubbleChartC data={foreignersData} xLabel={"Ausländeranteil in Prozent"} yLabel={"Abweichung vom Durchschnitt"} yMin={-4} yMax={5} />
        </ChartTile>
    );
} 