import apiClient from "./client"

export const register = (data) => {
    return apiClient("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
    })
}

export const login = (data) => {
    return apiClient("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
    })
}

export const getMe = () => {
    return apiClient("/auth/me")
}

export const logout = () => {
    return apiClient("/auth/logout", {
        method: "POST",
    })
}
