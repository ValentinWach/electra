export default function InputC({hidden, id, name, placeholder, label, onInputFunction} : {hidden: boolean, id: string, name: string, placeholder: string, label?: string, onInputFunction: (input: string) => void}) {
    return (
        <div>
            <input
                id={id}
                name={name}
                type="string"
                placeholder= {placeholder}
                aria-label= {label}
                className={`${hidden ? "invisible " : ""}h-7 max-w-52 block w-full mt-2 mb-0 rounded-md bg-white px-3 py-1.5 text-gray-900 font-normal placeholder:font-thin outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 text-sm`}
                onInput={ i => onInputFunction((i.target as HTMLInputElement).value)}
            />
        </div>
    )
}