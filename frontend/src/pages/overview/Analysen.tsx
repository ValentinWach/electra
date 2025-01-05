import IncomeC from "../../components/page-elements/Analysen/IncomeC.tsx";
import ForeignerShareC from "../../components/page-elements/Analysen/ForeignerShareC.tsx";
import { useBundestagsParteien } from "../../hooks/useBundestagsParteien";

export default function Analysen() {
    const { parteien, isLoading } = useBundestagsParteien();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-xl font-semibold text-gray-700">Loading analysis data...</div>
            </div>
        );
    }

    return (
        <div className={"flex flex-col items-center"}>
            <IncomeC parteien={parteien} />
            <ForeignerShareC parteien={parteien} />
        </div>
    );
}