import { useEffect, useState } from "react"

import PageContainer from "../components/layout/PageContainer"
import PageHeader from "../components/layout/PageHeader"
import NoteEmptyState from "../components/notes/NoteEmptyState"
import NoteForm from "../components/notes/NoteForm"
import NoteList from "../components/notes/NoteList"
import Spinner from "../components/ui/Spinner"
import { useNotes } from "../hooks/useNotes"

function Notes() {
    const { notes, loading, error, fetchNotes, addNote, editNote, removeNote } = useNotes()

    const [editingNote, setEditingNote] = useState(null)
    const [showForm, setShowForm] = useState(false)

    useEffect(() => {
        fetchNotes().catch((error) => {
            console.error(error)
        })
    }, [fetchNotes])

    const handleCreate = () => {
        setEditingNote(null)
        setShowForm(true)
    }

    const handleEdit = (note) => {
        setEditingNote(note)
        setShowForm(true)
    }

    const handleCancel = () => {
        setEditingNote(null)
        setShowForm(false)
    }

    const handleSubmit = async (data) => {
        if (editingNote) {
            await editNote(editingNote.id, data)
        } else {
            await addNote(data)
        }

        setEditingNote(null)
        setShowForm(false)
    }

    const handleDelete = async (id) => {
        await removeNote(id)
    }

    return (
        <PageContainer className="py-8">
            <div className="space-y-8">
                <PageHeader
                    title="Notes"
                    description="Create and manage your notes."
                    action={
                        !showForm ? (
                            <button
                                type="button"
                                onClick={handleCreate}
                                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                            >
                                Create Note
                            </button>
                        ) : null
                    }
                />

                {showForm && (
                    <div className="mx-auto w-full max-w-2xl">
                        <NoteForm
                            note={editingNote}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            loading={loading}
                            error={error}
                        />
                    </div>
                )}

                {loading && !notes.length ? (
                    <div className="flex justify-center py-16">
                        <Spinner />
                    </div>
                ) : notes.length ? (
                    <NoteList
                        notes={notes}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        loading={loading}
                    />
                ) : (
                    <NoteEmptyState onCreate={handleCreate} />
                )}
            </div>
        </PageContainer>
    )
}

export default Notes
