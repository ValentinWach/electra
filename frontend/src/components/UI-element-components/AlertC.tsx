import { InformationCircleIcon, ExclamationTriangleIcon, ExclamationCircleIcon } from '@heroicons/react/20/solid'
import { AlertData, AlertType } from '../../models/AlertData';

export default function AlertC({ alertData }: { alertData: AlertData }) {

    const color = (() => {
        switch (alertData.type) {
            case AlertType.info:
                return "blue";
            case AlertType.warning:
                return "yellow";
            case AlertType.error:
            default:
                return "red";
        }
    })();

    const icon = (() => {
        switch (alertData.type) {
            case AlertType.warning:
                return <ExclamationTriangleIcon aria-hidden="true" className="size-5 text-yellow-400" />;
            case AlertType.info:
            default:
                return <InformationCircleIcon aria-hidden="true" className="size-5 text-blue-400" />;
        }
    })();
    return (
        <div className={`rounded-md bg-${color}-50 p-4 mb-4`}>
            <div className="flex">
                <div className="shrink-0">
                    {icon}
                </div>
                <div className="ml-3">
                    {alertData.title && <h3 className={` font-medium text-${color}-800`}>{alertData.title}</h3>}
                    <div className={`mt-2  text-${color}-700`}>
                        <p>
                            {alertData.message}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}