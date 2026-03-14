import * as z from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from './ui/input'
import { Button } from './ui/button'
import {
    Field,
    FieldDescription,
    FieldError,
    FieldLabel,
    FieldSet,
} from "./ui/field"
import { api } from '~/lib/axios'
import type { APIResponse } from '~/lib/types'
import { toast } from 'sonner'
import axios from 'axios'
import { NavLink, useNavigate } from 'react-router'
import { queryClient, queryKeys } from '~/lib/react-query'
import { useState } from 'react'

console.log("Backend URL:", import.meta.env.VITE_BACKEND_URL);

const formSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters.")
        .max(32, "Username must be at most 32 characters."),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters.")
        .max(128, "Password must be at most 128 characters."),
})

export const SigninForm = () => {
    const navigate = useNavigate()
    const [isFormDisabled, setIsFormDisabled] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
            setIsFormDisabled(true)
            toast.loading('Signing in...', { id: "signin-loading" })
            console.log(data)
            const response = await api.post<APIResponse>('/api/users/signin', data)
            console.log(response)
            if (response.status >= 400 || !response.data.success) {
                toast.error(response.data.message)
                return
            }

            const signedInUser = response.data.data?.user
            if (!signedInUser) {
                throw new Error("Signin succeeded but no user was returned")
            }

            queryClient.setQueryData(queryKeys.auth.me, signedInUser)
            toast.success(response.data.message)
            navigate('/home', { replace: true })
        } catch (error) {
            console.error(error)
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message ?? error.message ?? "Unable to sign in")
            } else if (error instanceof Error) {
                toast.error(error.message)
            } else {
                toast.error("Unknown error")
            }
        } finally {
            setIsFormDisabled(false)
            toast.dismiss("signin-loading")
        }

    }
    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col p-3 bg-card text-card-foreground rounded-xl w-full md:w-1/3'>
            <div className='text-center'>
                <h1 className='font-bold text-lg'>Signin</h1>
                <p className='text-sm'>Don't have an account? Signup <NavLink to='/signup' className='text   -blue-300'>here</NavLink></p>
            </div>

            <FieldSet className='mt-3'>
                <Controller
                    name="username"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                            <Input
                                {...field}
                                id={field.name}
                                aria-invalid={fieldState.invalid}
                                placeholder="john.doe"
                                autoComplete="off"
                            />
                            <FieldDescription>
                                Enter your username or email
                            </FieldDescription>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
            </FieldSet>

            <FieldSet className='mt-3'>
                <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                            <Input
                                {...field}
                                id={field.name}
                                aria-invalid={fieldState.invalid}
                                placeholder="John@123456"
                                autoComplete="off"
                                type='password'
                            />
                            <FieldDescription>
                                Enter your password
                            </FieldDescription>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
            </FieldSet>

            <Button className='mt-3' type='submit' disabled={isFormDisabled}>Signin</Button>
        </form>
    )
}
