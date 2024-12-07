import Sidebar from './components/SidebarC.tsx';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Uebersicht from "./pages/Uebersicht.tsx";
import Wahlkreise from "./pages/Wahlkreise.tsx";
import {ElectionProvider} from "./context/ElectionContext.tsx";

function App() {
    return (
        <ElectionProvider>
            <Router>
                <div className={"flex flex-row justify-start items-stretch h-screen bg-gray-50"}>
                    <Sidebar/>
                    <div className={"flex-grow m-10 flex-col gap-10"}>
                        <h2>Header Placeholder</h2>
                        <Routes>
                            <Route path="/uebersicht" element={<Uebersicht/>}/>
                            <Route path="/wahlkreise" element={<Wahlkreise/>}/>
                        </Routes>
                    </div>
                </div>
            </Router>
        </ElectionProvider>
    );
}

export default App;