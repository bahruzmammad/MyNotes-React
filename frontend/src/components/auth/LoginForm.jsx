import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
import { z } from "zod"

import { useAuth } from "../../hooks/useAuth"
import Button from "../ui/Button"
import ErrorMessage from "../ui/ErrorMessage"
import Input from "../ui/Input"

const loginSchema = z.object({
    email: z.string().trim().email("Email düzgün deyil"),
    password: z.string().min(8, "Password minimum 8 simvol olmalıdır"),
})

function LoginForm() {
    const navigate = useNavigate()
    const location = useLocation()

    const { login, loading, error } = useAuth()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (data) => {
        try {
            await login(data)

            const from = location.state?.from?.pathname || "/notes"

            navigate(from, { replace: true })
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
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
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
                error={errors.password?.message}
            />

            <ErrorMessage>{error?.message}</ErrorMessage>

            <Button type="submit" loading={loading} className="w-full">
                Login
            </Button>
        </form>
    )
}

export default LoginForm
