export default function WahlzettelC({checkMode = false}: {checkMode?: boolean}) {

    const candidates = checkMode ? [
        {
            name: "Künast, Renate", 
            partyShortName: "Grüne",
            partyLongName: "BÜNDNIS 90/DIE GRÜNEN",
            description: "Mitgdlied des deutschen Bundestags (MdB)",
            location: "Berlin"
        }
    ] : [
        {
            name: "Künast, Renate",
            partyShortName: "Grüne", 
            partyLongName: "BÜNDNIS 90/DIE GRÜNEN",
            description: "Mitgdlied des deutschen Bundestags (MdB)",
            location: "Berlin"
        },
        {
            name: "Merkel, Angela",
            partyShortName: "CDU",
            partyLongName: "Christlich Demokratische Union Deutschlands", 
            description: "Bundeskanzlerin a.D.",
            location: "Berlin"
        },
        {
            name: "Scholz, Olaf",
            partyShortName: "SPD",
            partyLongName: "Sozialdemokratische Partei Deutschlands",
            description: "Bundeskanzler",
            location: "Hamburg"
        },
        {
            name: "Lindner, Christian",
            partyShortName: "FDP",
            partyLongName: "Freie Demokratische Partei",
            description: "Bundesminister der Finanzen",
            location: "Nordrhein-Westfalen"
        },
        {
            name: "Wagenknecht, Sahra",
            partyShortName: "BSW",
            partyLongName: "Bündnis Sahra Wagenknecht",
            description: "Mitglied des deutschen Bundestags (MdB)",
            location: "Nordrhein-Westfalen"
        }
    ]

    const partyLists = checkMode ? [
        {
            partyShortName: "CDU",
            partyLongName: "Christlich Demokratische Union Deutschlands",
            candidates: "Peter Meier, Johannes Müller, Markus Schmidt, Max Mustermann"
        }
    ] : [
        {
            partyShortName: "CDU",
            partyLongName: "Christlich Demokratische Union Deutschlands",
            candidates: "Peter Meier, Johannes Müller, Markus Schmidt, Max Mustermann"
        },
        {
            partyShortName: "SPD",
            partyLongName: "Sozialdemokratische Partei Deutschlands",
            candidates: "Anna Schmidt, Michael Weber, Sarah Meyer, Thomas Klein"
        },
        {
            partyShortName: "Grüne",
            partyLongName: "BÜNDNIS 90/DIE GRÜNEN",
            candidates: "Lisa Wagner, Felix Bauer, Julia Koch, David Fischer"
        },
        {
            partyShortName: "FDP",
            partyLongName: "Freie Demokratische Partei",
            candidates: "Martin Schulz, Laura Wolf, Daniel König, Sophie Becker"
        },
        {
            partyShortName: "BSW",
            partyLongName: "Bündnis Sahra Wagenknecht",
            candidates: "Robert Berg, Maria Krause, Paul Winter, Emma Richter"
        }
    ]

    const handleClearSelection = () => {
        const candidateInputs = document.getElementsByName('candidate');
        const partyInputs = document.getElementsByName('party');
        
        candidateInputs.forEach((input: any) => {
            input.checked = false;
        });
        
        partyInputs.forEach((input: any) => {
            input.checked = false;
        });
    };

    return (
        <>
        <div className="flex flex-col items-end justify-center">
            <div className="bg-[#f5f5f0] p-8 rounded-lg shadow-md">
                <h2 className="font-bold text-2xl pb-10 text-center w-[1000px]">{checkMode ? "Dies sind Ihre 2 Stimmen." : "Sie haben 2 Stimmen"} </h2>
                <div className="flex flex-row items-start justify-start gap-10 bg-[#f5f5f0] pb-5">
                    <h2 className="font-bold text-lg text-center w-[500px]">Hier 1 Stimme für die Wahl eines/einer Wahlkreiseabgeordneten <br /> (Erststimme)</h2>
                    <h2 className="font-bold text-lg text-center w-[500px]">Hier 1 Stimme für die Wahl einer Landesliste (Partei) <br /> (Zweitstimme)</h2>
                </div>
                <div className="flex flex-row items-start justify-start gap-10 bg-[#f5f5f0]">
                    <div className="flex flex-col gap-2">
                        <table className="w-[500px]">
                            {candidates.map((candidate, index) => {
                                const [lastName, firstName] = candidate.name.split(", ");
                                return (
                                    <tr key={index} className="border-solid border ">
                                        <td className="border-solid border border-black text-center font-bold w-[40px]">{index + 1}</td>
                                        <td className="border-solid border border-black pl-2 pr-4 w-[224px] border-r-0 h-24 overflow-hidden">
                                            <div className="flex flex-col items-start justify-between h-full">
                                                <p className="flex flex-wrap">
                                                    <span className="font-bold text-xl">{lastName},&nbsp;</span>
                                                    <span className="text-xl">{firstName}</span>
                                                </p>
                                                <div>
                                                    <p className="text-xs">{candidate.description}</p>
                                                    <p className="text-xs">{candidate.location}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="border-solid border border-black border-l-0 align-bottom pb-3 w-[224px] h-24 overflow-hidden">
                                            <p className="font-bold text-lg">{candidate.partyShortName}</p>
                                            <p className="text-xs">{candidate.partyLongName}</p>
                                        </td>
                                        <td className="border-solid border w-11 border-black">
                                            <div className="relative w-11 h-11">
                                                <input
                                                    type="radio"
                                                    name="candidate"
                                                    value={index + 1}
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
                        </table>
                    </div>
                    <div className="flex flex-col gap-2">
                        <table className="w-[500px]">
                            {partyLists.map((party, index) => (
                                <tr key={index} className="border-solid border border-blue-900">
                                    <td className="border-solid border w-11 border-blue-900">
                                        <div className="relative w-11 h-11">
                                            <input
                                                type="radio"
                                                name="party"
                                                value={`list-${index + 1}`}
                                                className="peer appearance-none w-11 h-11 border border-blue-900 rounded-full hover:cursor-pointer"
                                            />
                                            <div className="absolute inset-0 hidden peer-checked:block pointer-events-none">
                                                <div className="absolute rounded-full top-1/2 left-1/2 w-9 h-[2px] bg-blue-900 -translate-x-1/2 -translate-y-1/2 rotate-45 "></div>
                                                <div className="absolute rounded-full top-1/2 left-1/2 w-9 h-[2px] bg-blue-900 -translate-x-1/2 -translate-y-1/2 -rotate-45 "></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border-solid border border-blue-900 pl-2 pr-4 w-[154px] border-r-0 h-24 overflow-hidden">
                                        <div className="flex flex-col items-start justify-center h-full">
                                            <p className="flex flex-wrap">
                                                <span className="font-bold text-xl text-blue-900">{party.partyShortName}</span>
                                            </p>
                                        </div>
                                    </td>
                                    <td className="border-solid border border-blue-900 border-l-0 align-bottom pb-1 pr-3 w-[294px] h-24 overflow-hidden">
                                        <div className="flex flex-col items-start justify-between h-full">
                                            <p className="font-bold text-sm text-blue-900">{party.partyLongName}</p>
                                            <p className="text-xs text-blue-900">{party.candidates}</p>
                                        </div>
                                    </td>
                                    <td className="border-solid border border-blue-900 text-center font-bold w-[40px] text-blue-900">{index + 1}</td>
                                </tr>
                            ))}
                        </table>
                    </div>
                </div>
            </div>
            {!checkMode && <button
                type="button"
                onClick={handleClearSelection}
                className="mt-5 rounded-md bg-rose-800 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
                Auswahl löschen
            </button>}
        </div>
        </>
    );
}