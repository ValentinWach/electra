export default function PrimaryButtonC({label, size, onClick, disabled = false, width = "w-full"}: {label: string, size: "xs" | "sm" | "md" | "lg" | "xl", onClick: () => void, disabled?: boolean, width?: string}) {
    const sizeClasses = {
        xs: "px-2 py-1 text-xs",
        sm: "px-2 py-1 text-sm",
        md: "px-2.5 py-1.5 text-sm",
        lg: "px-3 py-2 text-sm",
        xl: "px-3.5 py-2.5 text-sm"
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-md bg-indigo-600 ${sizeClasses[size]} ${width} font-semibold ${disabled ? "opacity-50" : ""} text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
        >
            {label}
        </button>
    )
}