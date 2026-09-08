const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const apiClient = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token")

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    })

    const text = await response.text()

    let data

    try {
        data = text ? JSON.parse(text) : null
    } catch {
        data = text
    }

    if (!response.ok) {
        const error = new Error(typeof data === "string" ? data : data?.message || "Request failed")

        error.status = response.status
        error.data = data

        throw error
    }

    return data
}

export default apiClient
