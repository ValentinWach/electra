import ProgressBarC from "../../UI-element-components/ProgressBar";
import { useNavigate, useLocation } from "react-router-dom";
import { useVote } from "../../../context/VoteContext";
import { handleLogout } from "../../../utils/Logout";

export default function HeaderC() {
    const navigate = useNavigate();
    const { resetVoting } = useVote();
    const location = useLocation();
    const isAuthenticating = location.pathname.startsWith('/wahl/authentifizierung');

    return (
        <header className={"w-full h-auto top-0 sticky bg-white shadow-sm pt-5 pb-5 pl-10 pr-10 flex flex-row justify-between items-center"}>
            <img
                alt="Electra logo"
                src="/src/assets/Electra-Logo.svg"
                className="h-8 w-auto hover:cursor-pointer"
            />
            <div className={"w-2/3"}>
                <ProgressBarC />
            </div>
            <button
                type="button"
                className={`rounded-md disabled:opacity-50   bg-indigo-600 px-2.5 py-1 text-sm text-white font-semibold shadow-sm ring-1 ring-inset focus-visible:outline-indigo-600 enabled:hover:bg-indigo-500`}
                onClick={() => handleLogout(resetVoting, navigate)}
                disabled={isAuthenticating}
            >
                Logout
            </button>
        </header>
    )
}