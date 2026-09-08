import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import Button from "../ui/Button"
import ErrorMessage from "../ui/ErrorMessage"
import Input from "../ui/Input"
import Textarea from "../ui/Textarea"

const noteSchema = z.object({
    title: z.string().trim().min(1, "Title required"),
    content: z.string().trim().min(1, "Content required"),
})

function NoteForm({ note = null, onSubmit, onCancel, loading = false, error = null }) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(noteSchema),
        defaultValues: {
            title: "",
            content: "",
        },
    })

    useEffect(() => {
        reset({
            title: note?.title || "",
            content: note?.content || "",
        })
    }, [note, reset])

    const handleFormSubmit = async (data) => {
        try {
            await onSubmit(data)

            if (!note) {
                reset({
                    title: "",
                    content: "",
                })
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <form
            onSubmit={handleSubmit(handleFormSubmit)}
            noValidate
            className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
            <div>
                <h2 className="text-lg font-semibold text-gray-900">
                    {note ? "Edit Note" : "Create Note"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    {note ? "Update your note." : "Create a new note."}
                </p>
            </div>

            <Input
                id="title"
                label="Title"
                type="text"
                placeholder="Note title"
                {...register("title")}
                error={errors.title?.message}
            />

            <Textarea
                id="content"
                label="Content"
                placeholder="Write your note..."
                rows={8}
                {...register("content")}
                error={errors.content?.message}
            />

            <ErrorMessage>{error?.message}</ErrorMessage>

            <div className="flex items-center justify-end gap-2">
                {onCancel && (
                    <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                )}

                <Button type="submit" loading={loading}>
                    {note ? "Update Note" : "Create Note"}
                </Button>
            </div>
        </form>
    )
}

export default NoteForm
