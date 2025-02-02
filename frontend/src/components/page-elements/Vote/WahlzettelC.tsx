import { Abgeordneter, Wahl } from "../../../api";
import { Wahlkreis, WahlzettelParteiWrapper } from "../../../api";
import { useVote } from "../../../context/VoteContext";

export default function WahlzettelC({ wahlkreis, wahl, directCandidates, parties, checkMode = false }: { checkMode?: boolean, wahlkreis?: Wahlkreis, wahl?: Wahl, directCandidates?: Abgeordneter[], parties?: WahlzettelParteiWrapper[] }) {

    const { selectedDirectCandidate, selectedParty, setSelectedDirectCandidate: setDirectCandidate, setSelectedParty: setParty } = useVote();

    const handleClearSelection = () => {
        setDirectCandidate(null);
        setParty(null);
    };

    return (
        <>
            {wahlkreis && directCandidates && parties && (
                <div className="bg-[#f5f5f0] flex flex-col items-end justify-center p-8 rounded-lg shadow-md">
                    {!checkMode && <button
                        type="button"
                        onClick={handleClearSelection}
                        disabled={!selectedDirectCandidate && !selectedParty}
                        className="mt-5 disabled:opacity-50 rounded-md bg-gray-800 px-3 py-1.5 text-sm font-semibold text-white shadow-sm enabled:hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        Auswahl löschen
                    </button>}
                    {wahl && <h1 className="font-bold text-4xl pb-10 text-center w-[1000px]">{`Bundestagswahl ${wahl?.date.getFullYear()}`}</h1>}  
                    <h2 className="font-bold text-3xl pb-10 text-center w-[1000px]">{checkMode ? ( "Dies sind Ihre 2 Stimmen.") : "Sie haben 2 Stimmen"} </h2>
                    <h2 className="font-bold text-lg pb-10 text-center w-[1000px]">Ihr Wahlkreis: {wahlkreis.id} {wahlkreis.name}</h2>
                    <div className="flex flex-row items-start justify-start gap-10 bg-[#f5f5f0] pb-5">
                        <h2 className="font-bold text-lg text-center w-[500px]">Hier 1 Stimme für die Wahl eines/einer Wahlkreiseabgeordneten <br /> (Erststimme)</h2>
                        <h2 className="font-bold text-lg text-center w-[500px]">Hier 1 Stimme für die Wahl einer Landesliste (Partei) <br /> (Zweitstimme)</h2>
                    </div>
                    <div className="flex flex-row items-start justify-start gap-10 bg-[#f5f5f0]">
                        <div className="flex flex-col gap-2">
                            <table className="w-[500px]">
                                <tbody>
                                    {directCandidates.map((candidate, index) => {
                                        return (
                                            <tr key={index} className="border-solid border ">
                                                <td className="border-solid border border-black text-center font-bold w-[40px]">{index + 1}</td>
                                                <td className="border-solid border border-black pl-2 pr-4 w-[224px] max-w-[224px] border-r-0 h-24 overflow-hidden">
                                                    <div className="flex flex-col items-start justify-between h-full">
                                                        <p className="flex flex-wrap">
                                                            <span className="font-bold text-xl">{candidate.name},&nbsp;</span>
                                                            <span className="font-bold text-xl">{candidate.firstname}</span>
                                                        </p>
                                                        <div>
                                                            <p className="text-xs">{candidate.profession ?? ""}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="border-solid border border-black border-l-0 align-bottom pb-3 max-w-[224px] w-[224px] h-24 overflow-hidden">
                                                    <p className="font-bold text-lg">{candidate.party?.shortname ?? ""}</p>
                                                    <p className="text-xs">{candidate.party?.name ?? ""}</p>
                                                </td>
                                                <td className="border-solid border w-11 border-black">
                                                    <div className="relative w-11 h-11">
                                                        <input
                                                            type="radio"
                                                            disabled={checkMode}
                                                            name="candidate"
                                                            onChange={(e) => e.target.checked && setDirectCandidate(candidate)}
                                                            value={index + 1}
                                                            checked={selectedDirectCandidate?.id === candidate.id}
                                                            className="peer appearance-none w-11 h-11 border border-black rounded-full hover:cursor-pointer"
                                                        />
                                                        <div className="absolute inset-0 hidden peer-checked:block pointer-events-none">
                                                            <div className="absolute rounded-full top-1/2 left-1/2 w-9 h-[2px] bg-black -translate-x-1/2 -translate-y-1/2 rotate-45 "></div>
                                                            <div className="absolute rounded-full top-1/2 left-1/2 w-9 h-[2px] bg-black -translate-x-1/2 -translate-y-1/2 -rotate-45 "></div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex flex-col gap-2">
                            <table className="w-[500px]">
                                <tbody>
                                    {parties.map((party, index) => (
                                        <tr key={index} className="border-solid border border-blue-900">
                                            <td className="border-solid border w-11 border-blue-900">
                                                <div className="relative w-11 h-11">
                                                    <input
                                                        type="radio"
                                                        disabled={checkMode}
                                                        name="party"
                                                        onChange={(e) => e.target.checked && setParty(party)}
                                                        checked={selectedParty?.partei.id === party.partei.id}
                                                        value={`list-${index + 1}`}
                                                        className="peer appearance-none w-11 h-11 border border-blue-900 rounded-full hover:cursor-pointer"
                                                    />
                                                    <div className="absolute inset-0 hidden peer-checked:block pointer-events-none">
                                                        <div className="absolute rounded-full top-1/2 left-1/2 w-9 h-[2px] bg-blue-900 -translate-x-1/2 -translate-y-1/2 rotate-45 "></div>
                                                        <div className="absolute rounded-full top-1/2 left-1/2 w-9 h-[2px] bg-blue-900 -translate-x-1/2 -translate-y-1/2 -rotate-45 "></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="border-solid border border-blue-900 pl-2 pr-4 max-w-[154px] w-[154px] border-r-0 h-24 overflow-hidden">
                                                <div className="flex flex-col items-start justify-center h-full">
                                                    <p className="flex flex-wrap">
                                                        <span className="font-bold text-xl text-blue-900 break-words overflow-wrap hyphens-auto whitespace-normal" lang="de">{party.partei.shortname}</span>
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="border-solid border border-blue-900 border-l-0 align-bottom pb-1 pr-3 max-w-[294px] w-[294px] h-24 text-wrap overflow-hidden">
                                                <div className="flex flex-col items-start justify-between h-full">
                                                    <p className="font-bold text-sm text-blue-900">{party.partei.name ?? ""}</p>
                                                    <p className="text-xs text-blue-900">{party.topfive.map(p => `${p.name}, ${p.firstname}`).join("; ")}</p>
                                                </div>
                                            </td>
                                            <td className="border-solid border border-blue-900 text-center font-bold w-[40px] text-blue-900">{index + 1}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}