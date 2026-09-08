import { Link } from "react-router-dom"

import AuthLayout from "../components/auth/AuthLayout"
import LoginForm from "../components/auth/LoginForm"

function Login() {
    return (
        <AuthLayout
            title="Welcome back"
            description="Sign in to your account."
            footer={
                <p>
                    Don't have an account?{" "}
                    <Link to="/register" className="font-medium text-gray-900 hover:underline">
                        Register
                    </Link>
                </p>
            }
        >
            <LoginForm />
        </AuthLayout>
    )
}

export default Login
