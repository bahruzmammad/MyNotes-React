import { Navigate, Outlet, useLocation } from "react-router-dom"

import Spinner from "../components/ui/Spinner"
import { useAuth } from "../hooks/useAuth"

function ProtectedRoute() {
    const { isAuthenticated, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner size="md" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    return <Outlet />
}

export default ProtectedRoute
