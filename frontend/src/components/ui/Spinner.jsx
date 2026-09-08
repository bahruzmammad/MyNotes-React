function Spinner({ size = "md", className = "", centered = false }) {
    const sizes = {
        sm: "h-4 w-4 border-2",
        md: "h-6 w-6 border-2",
        lg: "h-8 w-8 border-2",
        xl: "h-12 w-12 border-[3px]",
    }

    const spinnerElement = (
        <div
            role="status"
            aria-label="Loading"
            className={`inline-block animate-spin rounded-full border-gray-200 border-t-black dark:border-zinc-700 dark:border-t-white ${sizes[size] || sizes.md} ${className}`}
        />
    )

    // Əgər centered={true} ötürülərsə, valideyn konteynerin tən ortasında çıxacaq
    if (centered) {
        return <div className="flex w-full items-center justify-center p-4">{spinnerElement}</div>
    }

    return spinnerElement
}

export default Spinner
