import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import Button from "../ui/Button"
import ErrorMessage from "../ui/ErrorMessage"
import Input from "../ui/Input"
import Textarea from "../ui/Textarea"

const profileSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name minimum 2 simvol olmalıdır")
        .max(100, "Name maksimum 100 simvol ola bilər"),
    bio: z.string().trim().max(500, "Bio maksimum 500 simvol ola bilər"),
    avatar_url: z.string().trim().max(500, "Avatar URL maksimum 500 simvol ola bilər"),
})

function ProfileForm({ profile, onSubmit, loading = false, error = null }) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: "",
            bio: "",
            avatar_url: "",
        },
    })

    useEffect(() => {
        reset({
            name: profile?.name || "",
            bio: profile?.bio || "",
            avatar_url: profile?.avatar_url || "",
        })
    }, [profile, reset])

    const handleFormSubmit = async (data) => {
        try {
            await onSubmit(data)
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
                <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>

                <p className="mt-1 text-sm text-gray-500">Update your profile information.</p>
            </div>

            <Input
                id="name"
                label="Name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                {...register("name")}
                error={errors.name?.message}
            />

            <Input id="email" label="Email" type="email" value={profile?.email || ""} disabled />

            <Textarea
                id="bio"
                label="Bio"
                placeholder="Tell us about yourself"
                rows={5}
                {...register("bio")}
                error={errors.bio?.message}
            />

            <Input
                id="avatar_url"
                label="Avatar URL"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                {...register("avatar_url")}
                error={errors.avatar_url?.message}
            />

            <ErrorMessage>{error?.message}</ErrorMessage>

            <div className="flex justify-end">
                <Button type="submit" loading={loading}>
                    Save Changes
                </Button>
            </div>
        </form>
    )
}

export default ProfileForm
