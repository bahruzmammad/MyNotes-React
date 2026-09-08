function ErrorMessage({ children, className = "" }) {
    if (!children) {
        return null
    }

    return (
        <p role="alert" className={`text-sm text-red-500 ${className}`}>
            {children}
        </p>
    )
}

export default ErrorMessage
