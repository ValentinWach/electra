import BubbleChartC from './BubbleChartC';
import ChartTile from './ChartTileC';
import {DropdownType} from "../models/DropDownData.ts";
import {Partei} from "../api";
import {useEffect, useState} from 'react';
import {fetchIncomeAnalysis, fetchSitzveteilung, fetchForeignerShareAnalysis} from "../apiServices.ts";
import {useElection} from "../context/ElectionContext.tsx";
import {ChartDataXYR} from "../models/ChartData.ts";
import {getPartyColor} from "../utils/utils.tsx";

export default function AnalysenC() {

    const {selectedElection} = useElection();
    const [parteien, setParteien] = useState<Partei[]>([]);
    const [selectedParteiIdForeigners, setSelectedParteiIdForeigners] = useState<number | null>(null);
    const [selectedParteiIdIncome, setSelectedParteiIdIncome] = useState<number | null>(null);
    const [incomeData, setIncomeData] = useState<ChartDataXYR>();
    const [foreignersData, setForeignersData] = useState<ChartDataXYR>();
    const [xMinIncome, setXMinIncome] = useState<number | undefined>(undefined);
    const [xMaxIncome, setXMaxIncome] = useState<number | undefined>(undefined);
    const [xMinForeigners, setXMinForeigners] = useState<number | undefined>(undefined);
    const [xMaxForeigners, setXMaxForeigners] = useState<number | undefined>(undefined);

    useEffect(() => {
        async function fetchParteien() {
            try {
                const data = await fetchSitzveteilung(selectedElection?.id ?? 0);
                const parteienData: Partei[] = data.distribution.map(d => d.party);
                setParteien(parteienData);
                if (parteienData.length > 0) {
                    setSelectedParteiIdIncome(parteienData[0].id);
                    setSelectedParteiIdForeigners(parteienData[0].id);
                }
            } catch (error) {
                console.error('Error fetching Parteien:', error);
            }
        }

        fetchParteien();
    }, [selectedElection]);

    useEffect(() => {
        async function fetchIncomeData() {
            try {
                const data = await fetchIncomeAnalysis(selectedElection?.id ?? 0, selectedParteiIdIncome ?? 0);
                const incomeData: ChartDataXYR = {
                    labels: data.wahlkreise.map(w => `WK ${w.wahlkreisId}: (TODO: Name)`),
                    datasets: [{
                        data: data.wahlkreise.filter(w => w.stimmen > 0).map(w => ({x: w.einkommen, y: w.stimmen, r: 2})),
                        backgroundColor: [getPartyColor(parteien.find(p => p.id === selectedParteiIdIncome)?.shortname ?? '')],
                    }]
                }
                setIncomeData(incomeData);
                const incomes = data.wahlkreise.map(w => w.einkommen);
                setXMinIncome(Math.min(...incomes));
                setXMaxIncome(Math.max(...incomes));
            }
            catch (error) {
                console.error('Error fetching Income Data:', error);
            }
        }
        fetchIncomeData();
    }, [selectedParteiIdIncome, selectedElection]);

    useEffect(() => {
        async function fetchForeignersData() {
            try {
                const data = await fetchForeignerShareAnalysis(selectedElection?.id ?? 0, selectedParteiIdForeigners ?? 0);
                const foreignersData: ChartDataXYR = {
                    labels: data.wahlkreise.map(w => `WK ${w.wahlkreisId}: (TODO: Name)`),
                    datasets: [{
                        data: data.wahlkreise.filter(w => w.stimmen > 0).map(w => ({x: w.auslaenderanteil, y: w.stimmen, r: 2})),
                        backgroundColor: [getPartyColor(parteien.find(p => p.id === selectedParteiIdForeigners)?.shortname ?? '')],
                    }]
                }
                setForeignersData(foreignersData);
                const foreignerShare = data.wahlkreise.map(w => w.auslaenderanteil);
                setXMinForeigners(Math.min(...foreignerShare));
                setXMaxForeigners(Math.max(...foreignerShare));
            }
            catch (error) {
                console.error('Error fetching Foreigners Data:', error);
            }
        }
        fetchForeignersData();
    }, [selectedParteiIdForeigners, selectedElection]);

    const dropdownData: DropdownType = {
        defaultChosen: parteien[0]?.id ?? 0,
        items: parteien.map((partei: Partei) => ({label: partei.shortname, id: partei.id})),
    }

    return (
        <>
            <ChartTile dropDownContent={dropdownData} dropDownFunction={setSelectedParteiIdIncome}
                       header={"Ergebnisse nach Durchschnittseinkommen"}>
                <BubbleChartC data={incomeData} xLabel={"Durchschnittseinkommen in Euro"} yLabel={"Stimmanteil in Prozent"} xMin={xMinIncome} xMax={xMaxIncome}/>
            </ChartTile>
            <ChartTile dropDownContent={dropdownData} dropDownFunction={setSelectedParteiIdForeigners} header={"Ergebnisse nach Ausländeranteil"}>
                <BubbleChartC data={foreignersData} xLabel={"Ausländeranteil in Prozent"} yLabel={"Stimmanteil in Prozent"} xMin={xMinForeigners} xMax={xMaxForeigners}/>
            </ChartTile>
        </>
    );
}