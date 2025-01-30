import { useEffect, useRef } from "react";

export default function TextAreaC({ 
  label, 
  placeholder = "", 
  id, 
  name, 
  rows, 
  inputFunction, 
  defaultValue,
  maxHeight = 200
}: { 
  label: string, 
  placeholder?: string, 
  id: string, 
  name: string, 
  rows: number, 
  inputFunction: (value: string) => void, 
  defaultValue?: string,
  maxHeight?: number
}) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Function to auto-resize the textarea
  const adjustHeight = () => {
    const textarea = textAreaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // Reset height to shrink if needed
      if (textarea.scrollHeight > maxHeight) {
        textarea.style.height = `${maxHeight}px`; // Limit to max height
        textarea.style.overflowY = "auto"; // Enable scrollbar
      } else {
        textarea.style.height = `${textarea.scrollHeight}px`; // Expand dynamically
        textarea.style.overflowY = "hidden"; // Hide scrollbar if not needed
      }
    }
  };

  useEffect(() => {
    adjustHeight(); // Adjust height when component mounts (for defaultValue)
  }, [defaultValue]);

  return (
    <div>
      <label className="block text-sm/6 font-medium text-gray-900">
        {label}
      </label>
      <div className="mt-2">
        <textarea
          ref={textAreaRef}
          id={id}
          name={name}
          rows={rows}
          placeholder={placeholder}
          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          defaultValue={defaultValue}
          onInput={(e) => {
            inputFunction(e.currentTarget.value);
            adjustHeight(); // Adjust height on input
          }}
          style={{ maxHeight: `${maxHeight}px`, overflowY: "hidden", resize: "none" }} // Initial styles
        />
      </div>
    </div>
  );
}
