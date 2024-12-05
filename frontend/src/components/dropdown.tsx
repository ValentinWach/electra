import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { useElection } from '../context/ElectionContext.tsx';
import {Wahl} from "../api";

export default function Dropdown() {
    const { elections, selectedElection, setSelectedElection } = useElection();

    const handleElectionChange = (newElection: Wahl) => {
        setSelectedElection(newElection);
    };

    return (
        <Menu as="div" className="w-full relative inline-block text-left">
            <div>
                <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                    {selectedElection ? selectedElection.date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }) : 'Select Election'}
                    <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
                </MenuButton>
            </div>

            <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
            >
                <div className="py-1">
                    {elections.map((election) => (
                        <MenuItem key={election.id}>
                            <button
                                onClick={() => handleElectionChange(election)}
                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                            >
                                {election.date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                            </button>
                        </MenuItem>
                    ))}
                </div>
            </MenuItems>
        </Menu>
    );
}