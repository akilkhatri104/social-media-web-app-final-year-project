import ProtectedRoute from "~/components/ProtectedRoute"
import { VerifyEmailForm } from "~/components/verifyEmailComponent"

function verifyEmail() {

    return (
        <div className="flex justify-center items-center">
            <ProtectedRoute>
                <VerifyEmailForm />
            </ProtectedRoute>
        </div>
    )
}

export default verifyEmail