import { X } from "lucide-react";
import { Button } from "./ui/button";
import { useLocation, useNavigate } from "react-router";
import { useMe } from "~/hooks/useMe";
import { useEffect, useState } from "react";


export default function VerifyEmailPrompt() {
    const { isAuth, isInitialLoading, data: user } = useMe()
    const location = useLocation()
    const navigate = useNavigate()
    const [dismissed, setDismissed] = useState(
        sessionStorage.getItem('email-verify-prompt-dismissed') === "true"
    )

    const handleDismiss = () => {
        setDismissed(true)
        sessionStorage.setItem('email-verify-prompt-dismissed', "true")
    }


    if (isInitialLoading) {
        return null
    }

    if (dismissed || !isAuth || user.emailVerified || location.pathname == '/verify-email')
        return null

    return (
        <div className="flex justify-between items-center p-2 bg-accent text-accent-foreground">
            <p>Your email is not verified, some features may not work.</p>
            <span className="flex items-center">
                <Button variant='ghost' onClick={handleDismiss}><X /></Button>
                <Button onClick={() => navigate('/verify-email')}>Verify Email</Button>
            </span>
        </div>
    )
}