import { useEffect, useState } from "react"

import {
    getMe,
    login as loginApi,
    logout as logoutApi,
    register as registerApi,
} from "../api/authApi"
import { AuthContext } from "./AuthContext.js"

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const login = async (data) => {
        setLoading(true)
        setError(null)

        try {
            const response = await loginApi(data)

            localStorage.setItem("token", response.token)
            setUser(response.user)

            return response
        } catch (error) {
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const register = async (data) => {
        setLoading(true)
        setError(null)

        try {
            const response = await registerApi(data)

            localStorage.setItem("token", response.token)
            setUser(response.user)

            return response
        } catch (error) {
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const logout = async () => {
        setError(null)

        try {
            await logoutApi()
        } catch (error) {
            setError(error)
        } finally {
            localStorage.removeItem("token")
            setUser(null)
        }
    }

    useEffect(() => {
        let active = true

        const checkAuth = async () => {
            const token = localStorage.getItem("token")

            if (!token) {
                if (active) {
                    setLoading(false)
                }
                return
            }

            try {
                const response = await getMe()

                if (active) {
                    setUser(response.user)
                }
            } catch (error) {
                localStorage.removeItem("token")

                if (active) {
                    setUser(null)
                    setError(error)
                }
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }

        checkAuth()

        return () => {
            active = false
        }
    }, [])

    const value = {
        user,
        loading,
        error,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
