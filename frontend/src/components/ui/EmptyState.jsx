function EmptyState({ title = "Nothing here yet", description, action, className = "" }) {
    return (
        <div
            className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 px-6 py-12 text-center ${className}`}
        >
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

            {description && <p className="mt-2 max-w-md text-sm text-gray-500">{description}</p>}

            {action && <div className="mt-5">{action}</div>}
        </div>
    )
}

export default EmptyState
