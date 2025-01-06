import IncomeC from "../../components/page-elements/Analysen/IncomeC.tsx";
import ForeignerShareC from "../../components/page-elements/Analysen/ForeignerShareC.tsx";
import { useBundestagsParteien } from "../../hooks/useBundestagsParteien";
import FullPageLoadingC from "../../components/UI-element-components/FullPageLoadingC.tsx";
import { useMinLoadingTime } from "../../hooks/useMinLoadingTime.ts";
export default function Analysen() {
    const { parteien, isLoading } = useBundestagsParteien();
    const showLoader = useMinLoadingTime(isLoading);

    if (showLoader) {
        return <FullPageLoadingC />;
    }

    return (
        <>
            <IncomeC parteien={parteien} />
            <ForeignerShareC parteien={parteien} />
        </>
    );
}