import { Navigate, Route, Routes } from 'react-router-dom';
import { ElectionProvider, useElection } from "../context/ElectionContext";
import { CalcOnAggregateProvider } from "../context/CalcOnAggregateContext";
import Sidebar from '../components/SidebarC';
import Uebersicht from "../pages/overview/Uebersicht";
import Wahlkreise from "../pages/overview/Wahlkreise";
import Abgeordnete from "../pages/overview/Abgeordnete";
import Parteien from "../pages/overview/Parteien";
import Analysen from "../pages/overview/Analysen";
import WahlkreiseDetail from '../pages/detail/WahlkreiseDetail';
import ParteiDetail from '../pages/detail/ParteiDetail';
import { useMinLoadingTime } from '../hooks/useMinLoadingTime';
import FullPageLoadingC from '../components/UI-element-components/FullPageLoadingC';
import { resultPrefix } from '../constants/PathPrefixes';

function ResultsContent() {
    const { isLoading } = useElection();
    const showLoader = useMinLoadingTime(isLoading, 150);

    if (showLoader) {
        return <FullPageLoadingC />;
    }

    return (
        <CalcOnAggregateProvider>
            <div className={"flex flex-row h-screen bg-gray-50"}>
                <Sidebar />
                <main className={"flex-grow p-10 flex flex-col items-center overflow-auto bg-gray-50"}>
                    <Routes>
                        <Route path="uebersicht" element={<Uebersicht />} />
                        <Route path="wahlkreise" element={<Wahlkreise />} />
                        <Route path="wahlkreise/:id" element={<WahlkreiseDetail />} />
                        <Route path="abgeordnete" element={<Abgeordnete />} />
                        <Route path="parteien" element={<Parteien />} />
                        <Route path="parteien/:id" element={<ParteiDetail />} />
                        <Route path="analysen" element={<Analysen />} />
                        <Route path="/*" element={<Navigate to={resultPrefix + "/uebersicht"} replace />} />
                    </Routes>
                </main>
            </div>
        </CalcOnAggregateProvider>
    );
}

export default function ResultsApp() {
    return (
        <ElectionProvider>
            <ResultsContent />
        </ElectionProvider>
    );
} 