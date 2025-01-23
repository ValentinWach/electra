import BubbleChartC from '../../chart-components/BubbleChartC.tsx';
import ChartTile from '../../UI-element-components/ContentTileC.tsx';
import {DropdownData} from "../../../models/DropDownData.ts";
import {Partei} from "../../../api/index.ts";
import {useEffect, useState} from 'react';
import {fetchIncomeAnalysis} from "../../../apiServices.ts";
import {useElection} from "../../../context/ElectionContext.tsx";
import {ChartDataXYR} from "../../../models/ChartData.ts";
import {getPartyColor} from "../../../utils/GetPartyColor.tsx";

export default function IncomeC({parteien} : {parteien: Partei[]}) {
    const {selectedElection} = useElection();
    const [selectedParteiId, setSelectedParteiId] = useState<number | null>(null);
    const [incomeData, setIncomeData] = useState<ChartDataXYR>();
    const [xMin, setXMin] = useState<number | undefined>(undefined);
    const [xMax, setXMax] = useState<number | undefined>(undefined);

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
                const incomeData: ChartDataXYR = {
                    labels: data.wahlkreise.map(w => `WK ${w.wahlkreisId}: (TODO: Name)`),
                    datasets: [{
                        data: data.wahlkreise
                            .filter(w => w.stimmanteil !== undefined && w.stimmanteil > 0)
                            .map(w => ({x: w.einkommen, y: w.stimmanteil!, r: 2})),
                        backgroundColor: [getPartyColor(parteien.find(p => p.id === selectedParteiId)?.shortname ?? '')],
                    }]
                }
                setIncomeData(incomeData);
                const incomes = data.wahlkreise.map(w => w.einkommen);
                setXMin(Math.min(...incomes));
                setXMax(Math.max(...incomes));
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
        items: parteien.map((partei: Partei) => ({label: partei.shortname, id: partei.id})),
    }

    return (
        <ChartTile dropDownContent={dropdownData} dropDownFunction={setSelectedParteiId} header={"Ergebnisse nach Durchschnittseinkommen"}>
            <BubbleChartC data={incomeData} xLabel={"Durchschnittseinkommen in Euro"} yLabel={"Stimmanteil in Prozent"} xMin={xMin} xMax={xMax}/>
        </ChartTile>
    );
} 