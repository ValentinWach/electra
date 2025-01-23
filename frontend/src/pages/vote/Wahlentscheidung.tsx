import { useNavigate } from "react-router-dom";
import WahlzettelC from "../../components/page-elements/Vote/WahlzettelC";
import { votePrefix } from "../../utils/Constants";
import { useVote } from "../../context/VoteContext";

export default function Wahlentscheidung() {
    const { wahlkreis, parties, candidates, setDirectCandidate, setParty } = useVote();
    const navigate = useNavigate();
    const handleGoToStimmabgabe = () => {
        navigate(`${votePrefix}/stimmabgabe`);
    };
    return (
        <div className="flex flex-col justify-start items-end">
            <WahlzettelC wahlkreis={wahlkreis} directCandidates={candidates} parties={parties?.parteien} onSelectDirectCandidate={setDirectCandidate} onSelectParty={setParty} />
            <button
                    type="button"
                    onClick={handleGoToStimmabgabe}
                    className="mt-5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                Zur Stimmabgabe
            </button>
        </div>
    );
}