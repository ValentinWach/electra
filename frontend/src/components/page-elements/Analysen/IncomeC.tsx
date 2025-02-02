import BubbleChartC from '../../chart-components/BubbleChartC.tsx';
import ChartTile from '../../UI-element-components/ContentTileC.tsx';
import {DropdownData} from "../../../models/DropDownData.ts";
import {Partei} from "../../../api/index.ts";
import {useEffect, useState} from 'react';
import {fetchIncomeAnalysis} from "../../../apiServices.ts";
import {useElection} from "../../../context/ElectionContext.tsx";
import {ChartDataXYR} from "../../../models/ChartData.ts";
import {getPartyColor} from "../../../utils/GetPartyColor.tsx";
import AlertC from "../../UI-element-components/AlertC.tsx";
import {AlertType} from "../../../models/AlertData.ts";

export default function IncomeC({parteien} : {parteien: Partei[]}) {
    const {selectedElection} = useElection();
    const [selectedParteiId, setSelectedParteiId] = useState<number | null>(null);
    const [incomeData, setIncomeData] = useState<ChartDataXYR>();

    useEffect(() => {
        if (parteien.length > 0) {
            setSelectedParteiId(parteien[0].id);
        }
    }, [parteien]);

    useEffect(() => {
        async function fetchIncomeData() {
            try {
                if (selectedParteiId === null) return;
                const data = await fetchIncomeAnalysis(selectedElection?.id ?? 0, selectedParteiId ?? 0);
                const filteredData = data.wahlkreise.filter(w => w.stimmanteil !== undefined);
                const sortedData = { ...data, wahlkreise: filteredData.sort((a, b) => a.einkommen - b.einkommen)};
                const incomeData: ChartDataXYR = {
                    labels: sortedData.wahlkreise.map(w => `WK ${w.wahlkreisId}: ${w.wahlkreisName}`),
                    datasets: [{
                        data: sortedData.wahlkreise
                            .map(w => ({x: w.einkommen, y: w.stimmanteil!, r: 2.5})),
                        backgroundColor: [getPartyColor(parteien.find(p => p.id === selectedParteiId)?.shortname ?? '')],
                    }]
                }
                setIncomeData(incomeData);
            }
            catch (error) {
                console.error('Error fetching Income Data:', error);
            }
        }
        fetchIncomeData();
    }, [selectedParteiId, selectedElection, parteien]);

    const dropdownData: DropdownData = {
        label: undefined,
        defaultChosenId: parteien[0]?.id ?? 0,
        items: parteien.filter(p => p.shortname != "SSW").map((partei: Partei) => ({label: partei.shortname, id: partei.id})),
    }

    return (
        <ChartTile dropDownContent={dropdownData} dropDownFunction={setSelectedParteiId} header={"Ergebnisse nach Durchschnittseinkommen"}>
            <BubbleChartC data={incomeData} xLabel={"Durchschnittseinkommen in Euro"} yLabel={"Zweitstimmenergebnis"} xMin={15000} xMax={33000} yMin={-3} yMax={5} />
            <AlertC alertData={{type: AlertType.infoGrey, message: "Für diese Darstellung werden standardisierte Werte verwendet. Der Wert 0 steht jeweils für das mittlere Zweitstimmenergebnis der Partei."}} />
        </ChartTile>
    );
} 