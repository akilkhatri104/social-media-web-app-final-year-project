import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useFormStatus } from "react-dom"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { useMe } from "~/hooks/useMe"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { api } from "~/lib/axios"
import type { APIResponse } from "~/lib/types"
import axios from "axios"
import { queryClient, queryKeys } from "~/lib/react-query"

type SubmitButtonProps = {
    idleLabel: string
    pendingLabel: string
}

function SubmitButton({ idleLabel, pendingLabel }: SubmitButtonProps) {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" disabled={pending}>
            {pending ? pendingLabel : idleLabel}
        </Button>
    )
}

export function VerifyEmailForm() {
    const { data, isInitialLoading } = useMe()
    const [emailSent, setEmailSent] = useState(false)
    const navigate = useNavigate()


    async function handleSendEmail(_: FormData) {
        try {
            toast("Sending OTP...", { id: "email-loading" })
            const response = await api.get<APIResponse>('/api/users/verify-email')
            toast.success(response.data.message)
            setEmailSent(true)
        } catch (error) {
            console.error(error)
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data.message)
            } else
                toast.error("Unknown Error")
        } finally {
            toast.dismiss("email-loading")
        }
    }

    async function handleOTP(formData: FormData) {
        try {
            toast("Verifying OTP...", { id: "otp-loading" })
            const otp = formData.get('otp')
            if (!otp || typeof otp !== 'string' || otp.length !== 6) {
                toast.error("Not a valid OTP")
                return
            }
            const response = await api.post<APIResponse>('/api/users/verify-email', { otp })

            toast.success(response.data.message)
            const verifiedUser = response.data.data?.user
            queryClient.setQueryData(queryKeys.auth.me, verifiedUser)
            queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
            navigate('/home')
        } catch (error) {
            console.error(error)
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data.message)
            } else
                toast.error("Unknown Error")
        } finally {
            toast.dismiss("otp-loading")
        }
    }

    return (
        <div className="bg-card p-5 rounded-xl">
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
                        <SubmitButton idleLabel="Send Email" pendingLabel="Sending..." />
                    </form>
                ) : (
                    <form action={handleOTP} className="flex flex-col gap-3">
                        <h1>Email Verification</h1>
                        <p>
                            We have sent the OTP (Check your SPAM folder if you can't find the email)
                        </p>
                        <Label htmlFor="otp">OTP</Label>
                        <Input id="otp" name="otp" maxLength={6} minLength={6} autoComplete="one-time-code" />
                        <SubmitButton idleLabel="Verify OTP" pendingLabel="Verifying..." />
                    </form>
                )
            )}
        </div>
    )
}
