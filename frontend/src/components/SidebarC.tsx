import {
    ChartPieIcon,
    HomeIcon,
    UsersIcon,
    UserGroupIcon,
    PresentationChartLineIcon
} from '@heroicons/react/24/outline'
import {Link, useLocation} from 'react-router-dom';
import DropdownC from "./UI-element-components/DropdownC.tsx";
import type {DropdownData} from "../models/DropDownData.ts";
import { useElection } from '../context/ElectionContext.tsx';
import { useNavigate } from 'react-router-dom';
import { resultPrefix } from '../constants/PathPrefixes.ts';


const navigation = [
    {name: 'Übersicht', href: resultPrefix + "/uebersicht", icon: HomeIcon, current: false},
    //{name: 'Bundesländer', href: '#', icon: ChartPieIcon, current: false},
    {name: 'Wahlkreise', href: resultPrefix + "/wahlkreise", icon: ChartPieIcon, current: false},
    {name: 'Abgeordnete', href: resultPrefix + "/abgeordnete", icon: UsersIcon, current: false},
    {name: 'Parteien', href: resultPrefix + "/parteien", icon: UserGroupIcon, current: false},
    {name: 'Analysen', href: resultPrefix + "/analysen", icon: PresentationChartLineIcon, current: false},
]

function classNames(...classes : any[]) {
    return classes.filter(Boolean).join(' ')
}

export default function Example() {
    const location = useLocation();
    const navigate = useNavigate();
    const { elections, setSelectedElection } = useElection();
    const handleElectionChange = (newElectionId: number) => {
        setSelectedElection(elections.find(e => e.id === newElectionId) ?? elections[0]);
    };

    const Wahl: DropdownData = {
        items: elections.map(election => ({
            label: election.date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }),
            id: election.id
        })),
        defaultChosenId: elections[0]?.id ?? 0,
        //label: "Wahljahr"
    };

    return (
        <div className="sticky top-0 gap-y-5 flex sm:w-52 sm:min-w-52 xl:w-60 xl:min-w-60 flex-col overflow-y-auto border-r border-gray-200 bg-white px-6">
            <div className="flex h-16 shrink-0 justify-center mt-2 items-center">
                <img
                    alt="Electra logo"
                    src="/src/assets/Electra-Logo.svg"
                    className="h-8 w-auto hover:cursor-pointer"
                    onClick={() => {
                        navigate('/uebersicht');
                    }}
                />
            </div>
            <div className="flex h-16 shrink-0 items-center border-b-2 mb-1 pb-7 border-b-gray-200 ">
                <DropdownC dropdownData={Wahl} dropDownFunction={handleElectionChange}></DropdownC>
            </div>
            <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                        <ul role="list" className="-mx-2 space-y-2">
                            {navigation.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        to={item.href}
                                        className={classNames(
                                            item.current = location.pathname.startsWith(item.href),
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
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </li>
                </ul>
            </nav>
        </div>)
}