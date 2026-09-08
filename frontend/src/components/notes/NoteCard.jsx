import Button from "../ui/Button"

function NoteCard({ note, onEdit, onDelete, loading = false }) {
    return (
        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>

                {note.content && (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                        {note.content}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => onEdit(note)}
                    disabled={loading}
                >
                    Edit
                </Button>

                <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(note.id)}
                    disabled={loading}
                >
                    Delete
                </Button>
            </div>
        </article>
    )
}

export default NoteCard
