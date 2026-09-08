import { forwardRef } from "react"

const Textarea = forwardRef(function Textarea(
    { label, error, id, className = "", rows = 5, ...props },
    ref,
) {
    return (
        <div className="space-y-2">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-900">
                    {label}
                </label>
            )}

            <textarea
                ref={ref}
                id={id}
                rows={rows}
                className={`w-full resize-y rounded-md border px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 ${
                    error
                        ? "border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-gray-900 focus:ring-gray-200"
                } ${className}`}
                {...props}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    )
})

export default Textarea
