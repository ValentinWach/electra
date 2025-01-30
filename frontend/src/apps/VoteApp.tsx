import { Route, Routes } from 'react-router-dom';
import { VoteProvider } from '../context/VoteContext';
import HeaderC from '../components/page-elements/Vote/HeaderC';
import Authentication from '../pages/vote/Authentication';
import ChooseParty from '../pages/vote/ChooseParty.tsx';
import Confirmation from '../pages/vote/Confirmation.tsx';
import { votePrefix } from '../constants/PathPrefixes.ts';
import { Navigate } from 'react-router-dom';

export default function VoteApp() {
    return (
        <VoteProvider>
            <div className={"h-screen w-screen flex flex-col justify-center bg-gray-50"}>
                <HeaderC />
                <main className={"flex-grow p-10 flex flex-col items-center overflow-auto bg-gray-50"}>
                    <Routes>
                        <Route path="authentifizierung" element={<Authentication />} />
                        <Route path="wahlzettel" element={<ChooseParty />} />
                        <Route path="bestaetigung" element={<Confirmation />} />
                        <Route path="/*" element={<Navigate to={votePrefix + "/authentifizierung"} replace />} />
                    </Routes>
                </main>
            </div>
        </VoteProvider>
    );
} 