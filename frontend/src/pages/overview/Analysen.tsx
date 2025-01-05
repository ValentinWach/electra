import IncomeC from "../../components/page-elements/Analysen/IncomeC.tsx";
import ForeignerShareC from "../../components/page-elements/Analysen/ForeignerShareC.tsx";

export default function Analysen() {
    return (
        <div className={"flex flex-col items-center"}>
            <IncomeC />
            <ForeignerShareC />
        </div>
    );
}