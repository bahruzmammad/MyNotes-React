import apiClient from "./client"

export const getNotes = () => {
    return apiClient("/notes")
}

export const getNote = (id) => {
    return apiClient(`/notes/${id}`)
}

export const createNote = (data) => {
    return apiClient("/notes", {
        method: "POST",
        body: JSON.stringify(data),
    })
}

export const updateNote = (id, data) => {
    return apiClient(`/notes/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    })
}

export const patchNote = (id, data) => {
    return apiClient(`/notes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}

export const deleteNote = (id) => {
    return apiClient(`/notes/${id}`, {
        method: "DELETE",
    })
}
