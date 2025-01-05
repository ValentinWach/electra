import { useState } from 'react'

export default function CheckboxC({setEnabledInputFunct, defaultChecked = false, label, description}: {setEnabledInputFunct: (checked: boolean) => void, defaultChecked?: boolean, label: string, description?: string}) {
    const [checked, setChecked] = useState(defaultChecked)

    return (
          <div className="flex gap-3">
            <div className="flex h-6 shrink-0 items-center">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={checked}
                  onChange={(e) => { setChecked(e.target.checked); setEnabledInputFunct(e.target.checked); }}
                  id={label}
                  name={label}
                  type="checkbox"
                  aria-describedby={description ? `${label}-description` : undefined}
                  className="col-start-1 row-start-1 appearance-none rounded border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-[:disabled]:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-[:checked]:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-[:indeterminate]:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6">
              <label htmlFor={label} className="font-medium text-gray-600">
                {label}
              </label>
              {description && (
                <span id={`${label}-description`} className="text-gray-600">
                  {' '}{description}
                </span>
              )}
            </div>
          </div>
    )
}