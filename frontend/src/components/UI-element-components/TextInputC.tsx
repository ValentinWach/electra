export default function TextInputC({ label, placeholder, id, name, inputFunction }: { label: string, placeholder: string, id: string, name: string, inputFunction: (value: string) => void }) {
  return (
    <div>
      <label className="block text-sm/6 font-medium text-gray-900 mb-[5px]">
        {label}
      </label>
      <div className="">
        <input
          id={id}
          name={name}
          placeholder={placeholder}
          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          onChange={(e) => inputFunction(e.target.value)}
        />
      </div>
    </div>
  )
}