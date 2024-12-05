import {ReactNode} from "react";
import Dropdown from "./dropdown.tsx";

interface CharttileProps {
    children?: ReactNode;
}

export default function Charttile({children, showfilter, header}: CharttileProps & { showfilter: boolean } & {header: string}) {
    return (
        <div
            className={"w-chart-lg max-lg:w-chart min-w-60 drop-shadow-lg bg-white rounded-md p-8    flex items-center flex-col gap-3   text-left mt-10 mb-10"}>
            <p className={"text-xl font-bold text-left text-gray-800"}>{header}</p>
            {showfilter && <Dropdown/>}
            {children}
        </div>
    );
}