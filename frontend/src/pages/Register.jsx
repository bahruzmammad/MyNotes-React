import { Link } from "react-router-dom"

import AuthLayout from "../components/auth/AuthLayout"
import RegisterForm from "../components/auth/RegisterForm"

function Register() {
    return (
        <AuthLayout
            title="Create your account"
            description="Register to start using MyNotes."
            footer={
                <p>
                    Already have an account?{" "}
                    <Link to="/login" className="font-medium text-gray-900 hover:underline">
                        Login
                    </Link>
                </p>
            }
        >
            <RegisterForm />
        </AuthLayout>
    )
}

export default Register
