import ProtectedRoute from "~/components/ProtectedRoute"
import { VerifyEmailForm } from "~/components/verifyEmailComponent"
import { useDocumentTitle } from "~/lib/title"

function verifyEmail() {
    useDocumentTitle("Verify Email");

    return (
        <div className="flex justify-center items-center">
            <VerifyEmailForm />
        </div>
    )
}

export default verifyEmail
