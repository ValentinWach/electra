import {
    ChartPieIcon,
    DocumentDuplicateIcon,
    HomeIcon,
    UsersIcon,
    UserGroupIcon,
    PresentationChartLineIcon
} from '@heroicons/react/24/outline'
import {Link, useLocation} from 'react-router-dom';
import DropdownC from "./UI-element-components/DropdownC.tsx";
import type {DropdownType} from "../models/DropDownData.ts";
import { useElection } from '../context/ElectionContext.tsx';

const navigation = [
    {name: 'Übersicht', href: '/uebersicht', icon: HomeIcon, current: false},
    //{name: 'Bundesländer', href: '#', icon: ChartPieIcon, current: false},
    {name: 'Wahlkreise', href: '/wahlkreise', icon: ChartPieIcon, current: false},
    {name: 'Abgeordnete', href: '/Abgeordnete', icon: UsersIcon, current: false},
    {name: 'Parteien', href: '/Parteien', icon: UserGroupIcon, current: false},
    {name: 'Analysen', href: '/Analysen', icon: PresentationChartLineIcon, current: false},
]
const teams = [
    {id: 1, name: 'Heroicons', href: '#', initial: 'H', current: false},
    {id: 2, name: 'Tailwind Labs', href: '#', initial: 'T', current: false},
    {id: 3, name: 'Workcation', href: '#', initial: 'W', current: false},
]

function classNames(...classes : any[]) {
    return classes.filter(Boolean).join(' ')
}

export default function Example() {
    const location = useLocation();
    const { elections, selectedElection, setSelectedElection } = useElection();
    const handleElectionChange = (newElectionId: number) => {
        setSelectedElection(elections.find(e => e.id === newElectionId) ?? elections[0]);
    };

    const Wahl: DropdownType = {
        items: elections.map(election => ({
            label: election.date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }),
            id: election.id
        })),
    };

    return (
        <div className="sticky top-0 flex w-64 flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
            <div className="flex h-16 shrink-0 items-center">
                <img
                    alt="Your Company"
                    src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
                    className="h-8 w-auto"
                />
            </div>
            <div className="flex h-16 shrink-0 items-center border-b-2 border-b-gray-200 pb-5">
                <DropdownC dropdownContent={Wahl} dropDownFunction={handleElectionChange}></DropdownC>
            </div>
            <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                        <ul role="list" className="-mx-2 space-y-1">
                            {navigation.map((item) => (
                                <li key={item.name}>
                                    <Link to={item.href}>
                                        <a
                                            className={classNames(
                                                item.current = location.pathname === item.href,
                                                item.current
                                                    ? 'bg-gray-50 text-indigo-600'
                                                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
                                                'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                                            )}
                                        >
                                            <item.icon
                                                aria-hidden="true"
                                                className={classNames(
                                                    item.current ? 'text-indigo-600' : 'text-gray-400 group-hover:text-indigo-600',
                                                    'size-6 shrink-0',
                                                )}
                                            />
                                            {item.name}
                                        </a>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </li>
                    <li>
                        <div className="text-xs/6 font-semibold text-gray-400">Your teams</div>
                        <ul role="list" className="-mx-2 mt-2 space-y-1">
                            {teams.map((team) => (
                                <li key={team.name}>
                                    <a
                                        href={team.href}
                                        className={classNames(
                                            team.current
                                                ? 'bg-gray-50 text-indigo-600'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
                                            'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
                                        )}
                                    >
                    <span
                        className={classNames(
                            team.current
                                ? 'border-indigo-600 text-indigo-600'
                                : 'border-gray-200 text-gray-400 group-hover:border-indigo-600 group-hover:text-indigo-600',
                            'flex size-6 shrink-0 items-center justify-center rounded-lg border bg-white text-[0.625rem] font-medium',
                        )}
                    >
                      {team.initial}
                    </span>
                                        <span className="truncate">{team.name}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </li>
                    <li className="-mx-6 mt-auto">
                        <a
                            href="#"
                            className="flex items-center gap-x-4 px-6 py-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-50"
                        >
                            <img
                                alt=""
                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                className="size-8 rounded-full bg-gray-50"
                            />
                            <span className="sr-only">Your profile</span>
                            <span aria-hidden="true">Samuel Sacher</span>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>)
}