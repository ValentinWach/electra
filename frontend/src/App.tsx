import Sidebar from './components/SidebarC.tsx';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Uebersicht from "./pages/overview/Uebersicht.tsx";
import Wahlkreise from "./pages/overview/Wahlkreise.tsx";
import Abgeordnete from "./pages/overview/Abgeordnete.tsx";
import Parteien from "./pages/overview/Parteien.tsx";
import { ElectionProvider, useElection } from "./context/ElectionContext.tsx";
import { CalcOnAggregateProvider } from "./context/CalcOnAggregateContext.tsx";
import Analysen from "./pages/overview/Analysen.tsx";
import FullPageLoadingC from './components/UI-element-components/FullPageLoadingC.tsx';
import { useMinLoadingTime } from './hooks/useMinLoadingTime';
import WahlkreiseDetail from './pages/detail/WahlkreiseDetail.tsx';
import ParteiDetail from './pages/detail/ParteiDetail.tsx';
import { resultPrefix, votePrefix } from './utils/Logout.tsx';
import Authentication from './pages/vote/Authentication.tsx';
import HeaderC from './components/page-elements/Vote/HeaderC.tsx';
import Wahlentscheidung from './pages/vote/Wahlentscheidung.tsx';
import Stimmabgabe from './pages/vote/Stimmabgabe.tsx';
import { VoteProvider } from './context/VoteContext.tsx';

function AppContent() {
    const { isLoading } = useElection();
    const showLoader = useMinLoadingTime(isLoading, 500);

    if (showLoader) {
        return <FullPageLoadingC />;
    }
    return (
        <Router>
            <Routes>
                <Route path={resultPrefix + "/*"} element={
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
                                </Routes>
                            </main>
                        </div>
                    </CalcOnAggregateProvider>
                } />
                <Route path={votePrefix + "/*"} element={
                    <VoteProvider>
                        <div className={"h-screen w-screen flex flex-col justify-center bg-gray-50"}>
                            <HeaderC />
                            <main className={"flex-grow p-10 flex flex-col items-center overflow-auto bg-gray-50"}>
                                <Routes>
                                    <Route path="authentication" element={<Authentication />} />
                                    <Route path="wahlentscheidung" element={<Wahlentscheidung />} />
                                    <Route path="stimmabgabe" element={<Stimmabgabe />} />
                                </Routes>
                            </main>
                        </div>
                    </VoteProvider>
                } />
            </Routes>
        </Router>
    );
}

function App() {
    return (
        <ElectionProvider>
            <AppContent />
        </ElectionProvider>
    );
}

export default App;