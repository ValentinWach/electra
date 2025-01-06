import Sidebar from './components/SidebarC.tsx';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Uebersicht from "./pages/overview/Uebersicht.tsx";
import Wahlkreise from "./pages/overview/Wahlkreise.tsx";
import Abgeordnete from "./pages/overview/Abgeordnete.tsx";
import Parteien from "./pages/overview/Parteien.tsx";
import {ElectionProvider, useElection} from "./context/ElectionContext.tsx";
import {CalcOnAggregateProvider} from "./context/CalcOnAggregateContext.tsx";
import Analysen from "./pages/overview/Analysen.tsx";
import FullPageLoadingC from './components/UI-element-components/FullPageLoadingC.tsx';
import { useMinLoadingTime } from './hooks/useMinLoadingTime';
import WahlkreiseDetail from './pages/detail/WahlkreiseDetail.tsx';
import ParteiDetail from './pages/detail/ParteiDetail.tsx';

function AppContent() {
    const { isLoading } = useElection();
    const showLoader = useMinLoadingTime(isLoading, 500);

    if (showLoader) {
        return <FullPageLoadingC />;
    }

    return (
        <CalcOnAggregateProvider>
            <Router>
                <div className={"flex flex-row h-screen bg-gray-50"}>
                    <Sidebar/>
                    {/* Main Content Area */}
                    <div className={"flex-grow flex flex-col overflow-auto bg-gray-50"}>
                        <header className={"sticky top-0 left-0 z-10"}>
                            <div className={"h-20 bg-white w-full shadow font-bold flex flex-row items-center justify-center"}>
                                Header Placeholder
                            </div>
                        </header>
                        <main className={"flex-grow p-10"}>
                            <Routes>
                                <Route path="/uebersicht" element={<Uebersicht/>}/>
                                <Route path="/wahlkreise" element={<Wahlkreise/>}/>
                                <Route path="/wahlkreise/:id" element={<WahlkreiseDetail/>}/>
                                <Route path="/abgeordnete" element={<Abgeordnete/>}/>
                                <Route path="/parteien" element={<Parteien/>}/>
                                <Route path="/parteien/:id" element={<ParteiDetail/>}/>
                                <Route path="/analysen" element={<Analysen/>}/>
                            </Routes>
                        </main>
                    </div>
                </div>
            </Router>
        </CalcOnAggregateProvider>
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