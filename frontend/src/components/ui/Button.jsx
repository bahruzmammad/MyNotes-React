function Button({
    children,
    type = "button",
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    className = "",
    ...props
}) {
    const variants = {
        primary: "bg-black text-white hover:bg-gray-800 focus:ring-gray-300",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-200",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-300",
        ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-200",
    }

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-3 text-base",
    }

    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={`inline-flex items-center justify-center rounded-md font-medium transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {loading ? "Loading..." : children}
        </button>
    )
}

export default Button
