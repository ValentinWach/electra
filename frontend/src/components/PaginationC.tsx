import {ArrowLongLeftIcon, ArrowLongRightIcon} from '@heroicons/react/20/solid'
import {useEffect, useState} from "react";

export default function PaginationC({numOfPages, switchPage, selectedPageProp}: {
    numOfPages: number,
    switchPage: (pageNum: number) => void,
    selectedPageProp: number
}) {
    const [selectedPage, setSelectedPage] = useState(selectedPageProp);

    useEffect(() => {
        setSelectedPage(selectedPageProp);
    }, [selectedPageProp]);

    function renderPageLink(i: number) {
        return (
            <a
                key={i}
                className={`inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium hover:cursor-pointer ${
                    selectedPage === i ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
                onClick={() => {
                    setSelectedPage(i);
                    switchPage(i);
                }}
            >
                {i}
            </a>
        );
    }

    function renderEllipses() {
        return (
            <span
                className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500"
            >
                ...
            </span>
        );
    }

    return (
        <nav className="flex w-full -mt-3 items-center justify-between border-t border-gray-200 px-4 sm:px-0">
            <div className="-mt-px flex w-0 flex-1">
                <button
                    disabled={selectedPage === 1}
                    className={`inline-flex items-center border-t-2 pr-1 pt-4 text-sm font-medium ${
                        selectedPage === 1
                            ? 'border-transparent text-gray-300 cursor-not-allowed'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                    onClick={() => {
                        switchPage(selectedPage - 1);
                        setSelectedPage(selectedPage - 1)
                    }}
                >
                    <ArrowLongLeftIcon aria-hidden="true" className="mr-3 size-5 text-gray-400"/>
                    Previous
                </button>
            </div>
            <div className="hidden md:-mt-px md:flex">
                {
                    Array.from({ length: numOfPages }, (_, j) => j + 1).map(i => {
                        if (numOfPages <= 9) {
                            return renderPageLink(i);
                        } else if (selectedPage < 5 || selectedPage > numOfPages - 4) { //Ellipsis in the middle
                            console.log("case ellipsis in the middle");
                            if (i < 5)
                                return renderPageLink(i);
                            else if (i === 5)
                                return renderEllipses();
                            else if (i > numOfPages - 4)
                                return renderPageLink(i);
                        } else { //Numbers shifting
                            if (i < 3)
                                return renderPageLink(i);
                            else if (i === 3)
                                return [renderEllipses()];

                            if (i === selectedPage - 1 || i === selectedPage || i === selectedPage + 1)
                                return renderPageLink(i);

                            else if (i > numOfPages - 2)
                                return renderPageLink(i);
                            else if (i === numOfPages - 2)
                                return renderEllipses();
                        }
                    })
                }
            </div>
            <div className="-mt-px flex w-0 flex-1 justify-end">
                <button
                    disabled={selectedPage === numOfPages}
                    className={`inline-flex items-center border-t-2 pl-1 pt-4 text-sm font-medium ${
                        selectedPage === numOfPages
                            ? 'border-transparent text-gray-300 cursor-not-allowed'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                    onClick={() => {
                        switchPage(selectedPage + 1);
                        setSelectedPage(selectedPage + 1)
                    }}
                >
                    Next
                    <ArrowLongRightIcon aria-hidden="true" className="ml-3 size-5 text-gray-400"/>
                </button>
            </div>
        </nav>
    )
}