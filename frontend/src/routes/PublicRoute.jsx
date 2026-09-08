import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"

function PublicRoute() {
    const { isAuthenticated, loading } = useAuth()

    if (loading) {
        return <div>Loading...</div>
    }

    if (isAuthenticated) {
        return <Navigate to="/notes" replace />
    }

    return <Outlet />
}

export default PublicRoute
