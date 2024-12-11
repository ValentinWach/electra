import {ReactNode} from "react";
import DropdownC from "./DropdownC.tsx";
import {DropdownType} from "../models/Chart-Data.ts";

interface CharttileProps {
    children?: ReactNode;
}

export default function ChartTileC({children, header, dropDownContent, dropDownFunction}: CharttileProps & {header: string, dropDownContent?: DropdownType, dropDownFunction?: (id: number) => void} & {}) {
    return (
        <div
            className={"w-chart-lg max-lg:w-chart min-w-60 drop-shadow-lg bg-white rounded-md p-8    flex items-center flex-col gap-3   text-left mt-8 mb-8"}>
            <p className={"text-xl font-bold text-left text-gray-800"}>{header}</p>
            {dropDownContent && dropDownFunction ? <DropdownC dropdownContent={dropDownContent} dropDownFunction={dropDownFunction}/> : null}
            {children}
        </div>
    );
}