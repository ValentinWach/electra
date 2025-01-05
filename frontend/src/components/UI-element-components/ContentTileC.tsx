import {ReactNode} from "react";
import DropdownC from "./DropdownC.tsx";
import {DropdownType} from "../../models/DropDownData.ts";

interface CharttileProps {
    children?: ReactNode;
}

export default function ContentTileC({children, header, doubleSize, dropDownContent, dropDownFunction}: CharttileProps & {header: string, doubleSize?: Boolean, dropDownContent?: DropdownType, dropDownFunction?: (id: number) => void} & {}) {
    doubleSize = doubleSize ?? false;
    return (
        <div
            className={`${doubleSize ? "w-chart-xl" : "w-chart-lg"} w-chart-lg max-lg:w-chart min-w-60 drop-shadow-lg bg-white rounded-md p-8    flex items-center flex-col gap-3   text-left mt-8 mb-8`}>
            <p className={"text-xl font-bold text-left text-gray-800"}>{header}</p>
            {dropDownContent && dropDownFunction ? <DropdownC dropdownContent={dropDownContent} dropDownFunction={dropDownFunction}/> : null}
            {children}
        </div>
    );
}