import { useCallback, useState } from "react"

import { createNote, deleteNote, getNote, getNotes, patchNote, updateNote } from "../api/notesApi"

export const useNotes = () => {
    const [notes, setNotes] = useState([])
    const [note, setNote] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchNotes = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await getNotes()
            setNotes(response.data || [])
            return response
        } catch (error) {
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchNote = useCallback(async (id) => {
        setLoading(true)
        setError(null)

        try {
            const response = await getNote(id)
            setNote(response.data)
            return response
        } catch (error) {
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }, [])

    const addNote = async (data) => {
        setLoading(true)
        setError(null)

        try {
            const response = await createNote(data)

            setNotes((currentNotes) => [response.data, ...currentNotes])

            return response
        } catch (error) {
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const editNote = async (id, data) => {
        setLoading(true)
        setError(null)

        try {
            const response = await updateNote(id, data)

            setNotes((currentNotes) =>
                currentNotes.map((currentNote) =>
                    currentNote.id === id
                        ? {
                              ...currentNote,
                              ...data,
                          }
                        : currentNote,
                ),
            )

            if (note?.id === id) {
                setNote((currentNote) => ({
                    ...currentNote,
                    ...data,
                }))
            }

            return response
        } catch (error) {
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const patchNoteById = async (id, data) => {
        setLoading(true)
        setError(null)

        try {
            const response = await patchNote(id, data)

            setNotes((currentNotes) =>
                currentNotes.map((currentNote) =>
                    currentNote.id === id
                        ? {
                              ...currentNote,
                              ...data,
                          }
                        : currentNote,
                ),
            )

            if (note?.id === id) {
                setNote((currentNote) => ({
                    ...currentNote,
                    ...data,
                }))
            }

            return response
        } catch (error) {
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const removeNote = async (id) => {
        setLoading(true)
        setError(null)

        try {
            const response = await deleteNote(id)

            setNotes((currentNotes) => currentNotes.filter((currentNote) => currentNote.id !== id))

            if (note?.id === id) {
                setNote(null)
            }

            return response
        } catch (error) {
            setError(error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    return {
        notes,
        note,
        loading,
        error,
        fetchNotes,
        fetchNote,
        addNote,
        editNote,
        patchNote: patchNoteById,
        removeNote,
    }
}
