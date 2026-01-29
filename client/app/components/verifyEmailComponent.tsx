import { Loader2 } from "lucide-react"
import { useEffect, useState, type FormEvent } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { useMe } from "~/hooks/useMe"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { api } from "~/lib/axios"
import type { APIResponse } from "~/lib/types"
import axios from "axios"

export function VerifyEmailForm() {
    const { isAuth, isInitialLoading, data } = useMe()
    const [emailSent, setEmailSent] = useState(false)
    const [emailSendPending, setEmailSendPending] = useState(false)
    const [emailOTPPending, setEmailOTPPending] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        if (!isInitialLoading) {
            if (!isAuth) {
                toast.error("User not logged in")
                navigate('/')
            }

            if (data?.user?.emailVerified) {
                toast.error("User email already verified")
                navigate('/')
            }
        }
    }, [isAuth])

    async function handleSendEmail() {
        try {
            toast("Sending OTP...")
            setEmailSendPending(true)
            const response = await api.get<APIResponse>('/api/users/verify-email')
            if (response.status >= 400) {
                toast.error("Error while sending email")
                return
            }

            toast.success(response.data.message)
            setEmailSent(true)
        } catch (error) {
            console.error(error)
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data.message)
            } else
                toast.error("Unknown Error")
        } finally {
            setEmailSendPending(false)
        }
    }

    async function handleOTP(formData: FormData) {
        try {
            setEmailOTPPending(true)
            toast("Verifying OTP...")
            const otp = formData.get('otp')
            if (!otp || typeof otp !== 'string' || otp.length !== 6) {
                toast.error("Not a valid OTP")
                return
            }
            const response = await api.post<APIResponse>('/api/users/verify-email', { otp })

            if (response.status >= 400) {
                toast.error("Error while sending email")
                return
            }

            toast.success(response.data.message)
            navigate('/')
        } catch (error) {
            console.error(error)
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data.message)
            } else
                toast.error("Unknown Error")
        } finally {
            setEmailOTPPending(false)
        }
    }

    return (
        <div className="bg-accent-foreground text-accent p-5 rounded-xl">
            {isInitialLoading ? (
                <div className="flex flex-col items-center justify-center"><Loader2 className="animate-spin" /> Loading...</div>
            ) : (
                !emailSent ? (
                    <form action={handleSendEmail} className="flex flex-col gap-3">
                        <h1>Email Verification</h1>
                        <p>
                            We will send an OTP to your email address
                        </p>
                        <h1>{data?.user?.email}</h1>
                        <Button type="submit" disabled={emailSendPending}>Send Email</Button>
                    </form>
                ) : (
                    <form action={handleOTP} className="flex flex-col gap-3">
                        <h1>Email Verification</h1>
                        <p>
                            We have sent the OTP (Check your SPAM folder if you can't find the email)
                        </p>
                        <Label htmlFor="otp">OTP</Label>
                        <Input name="otp" maxLength={6} minLength={6} />
                        <Button type="submit" disabled={emailOTPPending}>Verify OTP</Button>
                    </form>
                )
            )}
        </div>
    )
}