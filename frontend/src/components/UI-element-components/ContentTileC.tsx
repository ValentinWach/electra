import { ReactNode } from "react";
import DropdownC from "./DropdownC.tsx";
import { DropdownData } from "../../models/DropDownData.ts";

interface CharttileProps {
    children?: ReactNode;
}

export default function ContentTileC({ children, header, xlWidth, dropDownContent, loading = false, dropDownFunction }: CharttileProps & { header: string, xlWidth?: Boolean, dropDownContent?: DropdownData, dropDownFunction?: (id: number) => void } & { loading?: boolean }) {
    xlWidth = xlWidth ?? false;

    const tableSkeletonRow = (index: number) => (
        <div key={`skeleton-row-${index}`} className="flex flex-row mb-3 justify-evenly">
            {Array.from({ length: xlWidth ? 5 : 4 }).map((_, i) => (
                <div key={`skeleton-cell-${index}-${i}`} className="h-3 bg-gray-200 rounded-full dark:bg-gray-300 w-40 mb-2.5"></div>
            ))}
        </div>
    );

    const tileSkeleton = (
        <div role="status" className="w-full mt-2 p-4 border border-gray-100 rounded shadow-sm animate-pulse md:p-6 dark:border-gray-300">
            <div className="flex items-baseline mt-4 mb-12">
                {Array.from({ length: xlWidth ? 13 : 9 }).map((_, i) => (
                    <div 
                        key={`skeleton-column-${i}`} 
                        className={`w-full ${i > 0 ? 'ms-6' : ''} bg-gray-100 rounded-t-lg ${
                            i % 2 === 0 ? 'h-40' : i % 3 === 0 ? 'h-48' : 'h-32'
                        } dark:bg-gray-300`}
                    ></div>
                ))}
            </div>
            {Array.from({ length: xlWidth ? 4 : 3 }).map((_, i) => tableSkeletonRow(i))}
        </div>
    );
    return (

        <div
            className={`${xlWidth ? "max-w-[1300px]" : "max-w-[1100px]"} sm:w-full xl:w-[90%] 2xl:w-3/4 drop-shadow-lg bg-white rounded-md p-8 flex items-center flex-col gap-3 text-left mt-8 mb-8`}>
            <p className={"text-xl font-bold text-left text-gray-800"}>{header}</p>
            <div className={"flex flex-row justify-center w-full gap-10"}>
                {dropDownContent && dropDownFunction ? <DropdownC dropdownData={dropDownContent} dropDownFunction={dropDownFunction} /> : null}
            </div>
            {loading ? tileSkeleton : children}
        </div>
    );
}