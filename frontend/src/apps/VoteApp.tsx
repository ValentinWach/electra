import { Route, Routes } from 'react-router-dom';
import { VoteProvider } from '../context/VoteContext';
import HeaderC from '../components/page-elements/Vote/HeaderC';
import Authentication from '../pages/vote/Authentication';
import Wahlentscheidung from '../pages/vote/Wahlentscheidung';
import Stimmabgabe from '../pages/vote/Stimmabgabe';

export default function VoteApp() {
    return (
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
    );
} 