function PageContainer({ children, className = "" }) {
    return (
        <main className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>
            {children}
        </main>
    )
}

export default PageContainer
