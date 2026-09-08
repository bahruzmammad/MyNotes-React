import NoteCard from "./NoteCard"

function NoteList({ notes, onEdit, onDelete, loading = false }) {
    if (!notes?.length) {
        return null
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
                <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    loading={loading}
                />
            ))}
        </div>
    )
}

export default NoteList
