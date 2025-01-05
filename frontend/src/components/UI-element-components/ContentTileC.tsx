import { ReactNode } from "react";
import DropdownC from "./DropdownC.tsx";
import { DropdownData } from "../../models/DropDownData.ts";

interface CharttileProps {
    children?: ReactNode;
}

export default function ContentTileC({ children, header, doubleSize, dropDownContent, loading = false, dropDownFunction }: CharttileProps & { header: string, doubleSize?: Boolean, dropDownContent?: DropdownData, dropDownFunction?: (id: number) => void } & { loading?: boolean }) {
    doubleSize = doubleSize ?? false;

    const tableSkeletonRow =
        <div className="flex flex-row mb-3 justify-evenly">
            {Array.from({ length: doubleSize ? 5 : 4 }).map(_ => <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-300 w-40 mb-2.5"></div>)}
        </div>

    const tileSkeleton =
        <div role="status" className="w-full mt-2 p-4 border border-gray-100 rounded shadow-sm animate-pulse md:p-6 dark:border-gray-300">
            <div className="flex items-baseline mt-4 mb-12">
                <div className="w-full bg-gray-100 rounded-t-lg h-40 dark:bg-gray-300"></div>
                <div className="w-full h-48 ms-6 bg-gray-100 rounded-t-lg dark:bg-gray-300"></div>
                <div className="w-full bg-gray-100 rounded-t-lg h-32 ms-6 dark:bg-gray-300"></div>
                <div className="w-full h-44 ms-6 bg-gray-100 rounded-t-lg dark:bg-gray-300"></div>
                <div className="w-full bg-gray-100 rounded-t-lg h-36 ms-6 dark:bg-gray-300"></div>
                <div className="w-full bg-gray-100 rounded-t-lg h-40 ms-6 dark:bg-gray-300"></div>
                <div className="w-full h-48 ms-6 bg-gray-100 rounded-t-lg dark:bg-gray-300"></div>
                <div className="w-full bg-gray-100 rounded-t-lg h-32 ms-6 dark:bg-gray-300"></div>
                <div className="w-full bg-gray-100 rounded-t-lg h-44 ms-6 dark:bg-gray-300"></div>
                {doubleSize && (
                    <>
                        <div className="w-full h-36 ms-6 bg-gray-100 rounded-t-lg dark:bg-gray-300"></div>
                        <div className="w-full bg-gray-100 rounded-t-lg h-44 ms-6 dark:bg-gray-300"></div>
                        <div className="w-full h-32 ms-6 bg-gray-100 rounded-t-lg dark:bg-gray-300"></div>
                        <div className="w-full bg-gray-100 rounded-t-lg h-48 ms-6 dark:bg-gray-300"></div>
                    </>
                )}
            </div>
            {Array.from({ length: doubleSize ? 4 : 3 }).map(_ => tableSkeletonRow)}
        </div>
    return (

        <div
            className={`${doubleSize ? "w-chart-xl" : "w-chart-lg"} w-chart-lg max-lg:w-chart min-w-60 drop-shadow-lg bg-white rounded-md p-8 flex items-center flex-col gap-3 text-left mt-8 mb-8`}>
            <p className={"text-xl font-bold text-left text-gray-800"}>{header}</p>
            <div className={"flex flex-row justify-center w-full gap-10"}>
                {dropDownContent && dropDownFunction ? <DropdownC dropdownData={dropDownContent} dropDownFunction={dropDownFunction} /> : null}
            </div>
            {loading ? tileSkeleton : children}
        </div>
    );
}