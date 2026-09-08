import { Link, NavLink } from "react-router-dom"

import { useAuth } from "../../hooks/useAuth"
import Button from "../ui/Button"

function Navbar() {
    const { user, logout } = useAuth()

    const getNavLinkClass = ({ isActive }) =>
        `text-sm font-medium transition ${
            isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
        }`

    const handleLogout = async () => {
        await logout()
    }

    return (
        <nav className="border-b border-gray-200 bg-white">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link to="/notes" className="text-lg font-bold tracking-tight text-gray-900">
                    MyNotes
                </Link>

                <div className="flex items-center gap-6">
                    <NavLink to="/notes" className={getNavLinkClass}>
                        Notes
                    </NavLink>

                    <NavLink to="/profile" className={getNavLinkClass}>
                        Profile
                    </NavLink>

                    {user && (
                        <span className="hidden text-sm text-gray-500 sm:block">{user.name}</span>
                    )}

                    <Button type="button" variant="ghost" size="sm" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
