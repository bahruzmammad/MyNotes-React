import EmptyState from "../ui/EmptyState"

function NoteEmptyState({ onCreate }) {
    return (
        <EmptyState
            title="No notes yet"
            description="Create your first note to get started."
            action={
                onCreate ? (
                    <button
                        type="button"
                        onClick={onCreate}
                        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        Create Note
                    </button>
                ) : null
            }
        />
    )
}

export default NoteEmptyState
