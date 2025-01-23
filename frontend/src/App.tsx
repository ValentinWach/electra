import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { resultPrefix, votePrefix } from './utils/Logout.tsx';
import { lazy, Suspense } from 'react';
import FullPageLoadingC from './components/UI-element-components/FullPageLoadingC.tsx';

// Lazy load the components and their providers
const ResultsApp = lazy(() => import('./apps/ResultsApp.tsx').then(module => ({ default: module.default })));
const VoteApp = lazy(() => import('./apps/VoteApp.tsx').then(module => ({ default: module.default })));

function App() {
    return (
        <Router>
            <Suspense fallback={<FullPageLoadingC />}>
                <Routes>
                    <Route path={resultPrefix + "/*"} element={<ResultsApp />} />
                    <Route path={votePrefix + "/*"} element={<VoteApp />} />
                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;