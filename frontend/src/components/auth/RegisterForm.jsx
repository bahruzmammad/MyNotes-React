import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { z } from "zod"

import { useAuth } from "../../hooks/useAuth"
import Button from "../ui/Button"
import ErrorMessage from "../ui/ErrorMessage"
import Input from "../ui/Input"

const registerSchema = z
    .object({
        name: z.string().trim().min(2, "Name minimum 2 simvol olmalıdır"),
        email: z.string().trim().email("Email düzgün deyil"),
        password: z.string().min(8, "Password minimum 8 simvol olmalıdır"),
        confirmPassword: z.string().min(8, "Password minimum 8 simvol olmalıdır"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords eyni deyil",
        path: ["confirmPassword"],
    })

function RegisterForm() {
    const navigate = useNavigate()
    const { register: registerUser, loading, error } = useAuth()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    const onSubmit = async (data) => {
        try {
            await registerUser({
                name: data.name,
                email: data.email,
                password: data.password,
            })

            navigate("/notes", { replace: true })
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <Input
                id="name"
                label="Name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                {...register("name")}
                error={errors.name?.message}
            />

            <Input
                id="email"
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...register("email")}
                error={errors.email?.message}
            />

            <Input
                id="password"
                label="Password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...register("password")}
                error={errors.password?.message}
            />

            <Input
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
            />

            <ErrorMessage>{error?.message}</ErrorMessage>

            <Button type="submit" loading={loading} className="w-full">
                Register
            </Button>
        </form>
    )
}

export default RegisterForm
