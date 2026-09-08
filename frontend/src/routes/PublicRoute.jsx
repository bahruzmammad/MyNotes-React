import { Navigate, Outlet } from "react-router-dom"

import Spinner from "../components/ui/Spinner"
import { useAuth } from "../hooks/useAuth"

function PublicRoute() {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner size="md" />
            </div>
        )
    }

    if (isAuthenticated) {
        return <Navigate to="/notes" replace />
    }

    return <Outlet />
}

export default PublicRoute
