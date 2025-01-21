import ProgressBarC from "../../UI-element-components/ProgressBar";

export default function HeaderC() {
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
                className="rounded-full  bg-white px-2.5 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
                Abbrechen
            </button>
        </header>
    )
}