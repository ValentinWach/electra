import {Menu, MenuButton, MenuItem, MenuItems} from '@headlessui/react';
import {ChevronDownIcon} from '@heroicons/react/20/solid';
import type {DropdownData} from "../../models/DropDownData.ts";
import {useState} from "react";

export default function DropdownC({dropdownData, dropDownFunction}: {
    dropdownData: DropdownData,
    dropDownFunction: (id: number) => void
}) {
    const [currentValue, setCurrentValue] = useState<number>(dropdownData.defaultChosenId)

    return (
        <Menu as="div" className="w-52 relative inline-block text-left">
            {dropdownData.label && (
                <div className="mb-2 font-medium  text-gray-800 text-sm">{dropdownData.label}</div>
            )}
            <div>
                <MenuButton
                    className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                    {dropdownData.items.find(i => i.id === currentValue)?.label ?? "No label defined"}
                    <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400"/>
                </MenuButton>
            </div>

            <MenuItems
                transition
                className="absolute right-0 z-50 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
            >
                <div className="py-1">
                    {dropdownData.items.map((item) => (
                        <MenuItem key={item.id}>
                            <button
                                onClick={() => { dropDownFunction(item.id); setCurrentValue(item.id); }}
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                            >
                                {item.label}
                            </button>
                        </MenuItem>
                    ))}
                </div>
            </MenuItems>
        </Menu>
    );
}