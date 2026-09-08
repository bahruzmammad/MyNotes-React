import { Navigate, Route, Routes } from "react-router-dom"

import Login from "./pages/Login"
import Notes from "./pages/Notes"
import Profile from "./pages/Profile"
import Register from "./pages/Register"
import ProtectedLayout from "./routes/ProtectedLayout"
import ProtectedRoute from "./routes/ProtectedRoute"
import PublicRoute from "./routes/PublicRoute"

function App() {
    return (
        <Routes>
            <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>

            <Route element={<ProtectedRoute />}>
                <Route element={<ProtectedLayout />}>
                    <Route path="/notes" element={<Notes />} />
                    <Route path="/profile" element={<Profile />} />
                </Route>
            </Route>

            <Route path="/" element={<Navigate to="/notes" replace />} />
            <Route path="*" element={<Navigate to="/notes" replace />} />
        </Routes>
    )
}

export default App
