import { LockClosedIcon, IdentificationIcon } from '@heroicons/react/24/outline'
import AlertC from '../../UI-element-components/AlertC'
import { AlertType, AlertData } from '../../../models/AlertData'
import { useState } from 'react';
import ProgressLoaderFullWidthC from '../_shared/ProgressLoaderFullWidthC';

export default function AuthenticationC({ isAuthenticating, onAuthenticate }: { isAuthenticating: boolean, onAuthenticate: (token: string) => void }) {
    const [token, setToken] = useState<string>("");
    const [identification, setIdentification] = useState<string>("");

    const alertData: AlertData = {
        title: "Wahltoken",
        message: "Sie haben einen anonymen Wahltoken per Post erhalten. Durch Ihre Ausweisnummer wird einmalig geprüft, ob der Token zu Ihnen gehört. Die Wahl selbst ist anonym.",
        type: AlertType.info
    }

    return (
        <>
            <div className="flex min-h-full flex-1 flex-col items-start justify-start py-12 mt-10 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center justify-center">
                    <img
                        alt="Electra logo"
                        src="/src/assets/ElectraLogoNoText.svg"
                        className="h-8 w-auto hover:cursor-pointer"
                    />
                    <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        Authentifizierung
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
                    <div className="w-full bg-white shadow rounded-lg px-1">
                        {isAuthenticating && <ProgressLoaderFullWidthC />}
                        <div className="bg-white px-6 py-12">
                            <AlertC alertData={alertData} />
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="token" className="block font-medium text-gray-900">
                                        Wahltoken
                                    </label>
                                    <div className="mt-2 flex flex-row items-center justify-center">
                                        <div className="w-12 h-10 bg-gray-200 rounded-l-md flex items-center justify-center outline outline-1 -outline-offset-1 outline-gray-300">
                                            <LockClosedIcon className="size-6 text-gray-600" />
                                        </div>
                                        <input
                                            id="token"
                                            name="token"
                                            type="text"
                                            required={true}
                                            className="block w-full rounded-r-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                            onChange={(e) => setToken(e.target.value)}
                                            value={token}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="identification" className="block font-medium text-gray-900">
                                        Ausweisnummer
                                    </label>
                                    <div className="mt-2 flex flex-row items-center justify-center">
                                        <div className="w-12 h-10 bg-gray-200 rounded-l-md flex items-center justify-center outline outline-1 -outline-offset-1 outline-gray-300">
                                            <IdentificationIcon className="size-6 text-gray-600" />
                                        </div>
                                        <input
                                            id="identification"
                                            name="identification"
                                            type="text"
                                            required={true}
                                            className="block w-full rounded-r-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                            onChange={(e) => setIdentification(e.target.value)}
                                            value={identification}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="button"
                                        onClick={() => onAuthenticate(token)}
                                        className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    >
                                        Login
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}