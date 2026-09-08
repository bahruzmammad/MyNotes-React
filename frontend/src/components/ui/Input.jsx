import { forwardRef } from "react"

const Input = forwardRef(function Input({ label, error, id, className = "", ...props }, ref) {
    return (
        <div className="space-y-2">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-900">
                    {label}
                </label>
            )}

            <input
                ref={ref}
                id={id}
                className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 ${
                    error
                        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-gray-900 focus:ring-gray-200"
                } ${className}`}
                {...props}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    )
})

export default Input
