import { useState } from "react"
import { VerifyEmailForm } from "~/components/verifyEmailComponent"
import { useMe } from "~/hooks/useMe"

function verifyEmail() {

    return (
        <div className="flex justify-center items-center">
            <VerifyEmailForm />
        </div>
    )
}

export default verifyEmail