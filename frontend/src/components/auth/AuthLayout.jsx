function AuthLayout({ title, description, children, footer }) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>

                        {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
                    </div>

                    {children}

                    {footer && (
                        <div className="mt-6 border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}

export default AuthLayout
