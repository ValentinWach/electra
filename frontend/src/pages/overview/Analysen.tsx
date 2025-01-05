import IncomeC from "../../components/page-elements/Analysen/IncomeC.tsx";
import ForeignerShareC from "../../components/page-elements/Analysen/ForeignerShareC.tsx";
import { useBundestagsParteien } from "../../hooks/useBundestagsParteien";
import FullPageLoadingC from "../../components/UI-element-components/FullPageLoadingC.tsx";
import { useEffect, useState } from "react";

export default function Analysen() {
    const { parteien, isLoading } = useBundestagsParteien();
    const [showLoader, setShowLoader] = useState(true);

    useEffect(() => {
        if (!isLoading) {
            const timeout = setTimeout(() => {
                setShowLoader(false);
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [isLoading]);

    if (showLoader) {
        return <FullPageLoadingC />;
    }

    return (
        <div className={"flex flex-col items-center"}>
            <IncomeC parteien={parteien} />
            <ForeignerShareC parteien={parteien} />
        </div>
    );
}