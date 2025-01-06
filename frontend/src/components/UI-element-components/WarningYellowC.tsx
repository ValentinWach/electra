import { ExclamationTriangleIcon } from '@heroicons/react/20/solid'

export default function WarningYellowC({text}: {text: string}) {
    return (
        <div className="mt-10 w-1/3 border-l-4 border-yellow-400 bg-yellow-50 p-4">
          <div className="flex">
            <div className="shrink-0">
              <ExclamationTriangleIcon aria-hidden="true" className="size-8 text-yellow-400" />
            </div>
            <div className="ml-3 text-lg">
              <p className=" text-yellow-700">
                {text}
              </p>
            </div>
          </div>
        </div>
      )
}