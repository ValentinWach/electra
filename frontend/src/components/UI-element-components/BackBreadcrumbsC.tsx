import {BackBreadcrumbsData} from "../../models/BackBreadcrumbsData.ts";
import {ArrowLeftIcon} from "@heroicons/react/24/outline";

export default function BackBreadcrumbsC({breadcrumbData, backFunction}: {
    breadcrumbData: BackBreadcrumbsData,
    backFunction: () => void
}) {
    return (
        <nav aria-label="Breadcrumb" className="flex">
            <ol role="list" className="flex items-center space-x-4">
                <li>
                    <div>
                        <a onClick={backFunction} className="text-gray-400 cursor-pointer hover:text-gray-500">
                            <ArrowLeftIcon aria-hidden="true" className="size-5 shrink-0 font-bold" strokeWidth={3} />
                            <span className="sr-only">Home</span>
                        </a>
                    </div>
                </li>
                {breadcrumbData.items.map((item, index) => (
                    <li key={item}>
                        <div className={`flex items-center ${index === 0 ? 'cursor-pointer' : ''}`}
                             onClick={index === 0 ? backFunction : undefined}>
                            <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"
                                 className="size-5 shrink-0 text-gray-400" stroke="currentColor">
                                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z"/>
                            </svg>
                            <p className={`ml-4  font-medium text-gray-500 ${index === 0 ? 'hover:text-gray-600' : ""}`}>{item}</p>
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    )
}