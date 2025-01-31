import { InformationCircleIcon, ExclamationTriangleIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/20/solid'
import { AlertData, AlertType } from '../../models/AlertData';

export default function AlertC({ alertData }: { alertData: AlertData }) {

    const getColorClasses = (type: AlertType) => {
        switch (type) {
            case AlertType.info:
                return {
                    bg: "bg-blue-100",
                    text: "text-blue-800",
                    textLight: "text-blue-700"
                };
            case AlertType.warning:
                return {
                    bg: "bg-yellow-100", 
                    text: "text-yellow-800",
                    textLight: "text-yellow-700"
                };
            case AlertType.success:
                return {
                    bg: "bg-green-100",
                    text: "text-green-800",
                    textLight: "text-green-700"
                };
            case AlertType.error:
            default:
                return {
                    bg: "bg-red-100",
                    text: "text-red-800", 
                    textLight: "text-red-700"
                };
        }
    };

    const colorClasses = getColorClasses(alertData.type);

    const icon = (() => {
        switch (alertData.type) {
            case AlertType.warning:
                return <ExclamationTriangleIcon aria-hidden="true" className="size-5 text-yellow-400" />;
            case AlertType.error:
                return <ExclamationCircleIcon aria-hidden="true" className="size-5 text-red-400" />;
            case AlertType.success:
                return <CheckCircleIcon aria-hidden="true" className="size-5 text-green-400" />;
            case AlertType.info:
            default:
                return <InformationCircleIcon aria-hidden="true" className="size-5 text-blue-400" />;
        }
    })();

    return (
        <div className={`rounded-md ${colorClasses.bg} p-4 mb-4 w-full`}>
            <div className="flex">
                <div className="shrink-0">
                    {icon}
                </div>
                <div className="ml-3">
                    {alertData.title && <h3 className={`font-medium ${colorClasses.text}`}>{alertData.title}</h3>}
                    <div className={`${alertData.title ? "mt-2" : ""} ${colorClasses.textLight} font-normal text-sm`}>
                        <p>
                            {alertData.message}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}