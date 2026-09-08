function PageHeader({ title, description, action, className = "" }) {
    return (
        <header
            className={`flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between ${className}`}
        >
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                    {title}
                </h1>

                {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
            </div>

            {action && <div className="shrink-0">{action}</div>}
        </header>
    )
}

export default PageHeader
