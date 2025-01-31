import { useState } from "react";

export default function RadioC({ 
    radioData, 
    defaultCheckedId, 
    changeFunction 
}: { 
    radioData: { id: string, title: string }[], 
    defaultCheckedId: string, 
    changeFunction: (id: string) => void 
}) {
    const [selectedId, setSelectedId] = useState(defaultCheckedId);
    const handleChange = (id: string) => {
        setSelectedId(id);
        changeFunction(id);
    };

    return (
        <fieldset>
            <div className="mt-6 space-y-6 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
                {radioData.map((radio) => (
                    <div key={radio.id} className="flex items-center">
                        <input
                            checked={radio.id === selectedId}
                            id={radio.id}
                            name="radio-group"
                            type="radio"
                            onChange={() => handleChange(radio.id)}
                            className="relative size-4 appearance-none rounded-full border border-gray-300 bg-white before:absolute before:inset-1 before:rounded-full before:bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:before:bg-gray-400 forced-colors:appearance-auto forced-colors:before:hidden [&:not(:checked)]:before:hidden"
                        />
                        <label htmlFor={radio.id} className="ml-3 block text-sm/6 font-medium text-gray-900">
                            {radio.title}
                        </label>
                    </div>
                ))}
            </div>
        </fieldset>
    );
}