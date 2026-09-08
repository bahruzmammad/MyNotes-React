import apiClient from "./client"

export const getProfile = () => {
    return apiClient("/profile")
}

export const updateProfile = (data) => {
    return apiClient("/profile", {
        method: "PUT",
        body: JSON.stringify(data),
    })
}
