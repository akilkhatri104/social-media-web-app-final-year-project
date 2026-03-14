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
import { useEffect, useState } from 'react'

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
    name: z
        .string()
        .min(3, "Name must be at least 3 characters.")
        .max(32, "Name must be at most 32 characters."),
    username: z
        .string()
        .min(3, "Username must be at least 3 characters.")
        .max(32, "Username must be at most 32 characters.")
        .refine((username) => /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/gim.test(username), {
            message: 'Usernames can contain characters a-z, 0-9, underscores and periods. The username cannot start with a period nor end with a period. It must also not have more than one period sequentially. Max length is 30 chars.',
        }),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters.")
        .max(128, "Password must be at most 128 characters."),
    email: z
        .email("Invalid email"),
    image: z
        .instanceof(File)
        .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
        .refine(
            (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
            "Only .jpg, .jpeg, .png and .webp formats are supported."
        )
        .optional()
})

export const SignupForm = () => {
    const navigate = useNavigate()
    const [isFormDisabled, setIsFormDisabled] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    const image = form.watch("image")
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        if (!image) {
            setPreviewUrl(null)
            return
        }

        const objectUrl = URL.createObjectURL(image)
        setPreviewUrl(objectUrl)

        return () => {
            URL.revokeObjectURL(objectUrl)
        }
    }, [image])

    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
            setIsFormDisabled(true)
            toast.loading("Signing up...", { id: "signup-loading" })

            const formData = new FormData()
            formData.append("name", data.name)
            formData.append("username", data.username)
            formData.append("email", data.email)
            formData.append("password", data.password)

            if (data.image) {
                formData.append("image", data.image)
            }
            const response = await api.post<APIResponse>('/api/users/signup', formData)


            if (!response.data.success) {
                toast.error(response.data.message)
                return
            }

            const signedUpUser = response.data.data?.user
            if (!signedUpUser) {
                throw new Error("Signup succeeded but no user was returned")
            }

            queryClient.setQueryData(queryKeys.auth.me, signedUpUser)
            toast.success(response.data.message)
            navigate('/home', { replace: true })
        } catch (error) {
            console.error(error)
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message ?? error.message ?? "Unable to sign up")
            } else if (error instanceof Error) {
                toast.error(error.message)
            } else {
                toast.error("Unknown error")
            }
        } finally {
            setIsFormDisabled(false)
            toast.dismiss("signup-loading")
        }

    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col p-3 bg-card text-card-foreground rounded-xl w-full md:w-1/3'>
            <div className='text-center'>
                <h1 className='font-bold text-lg'>Signup</h1>
                <p className='text-sm'>Already have an account? Signin <NavLink to='/signin'>here</NavLink></p>
            </div>

            <FieldSet className='mt-3'>
                <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                            <Input
                                {...field}
                                id={field.name}
                                aria-invalid={fieldState.invalid}
                                placeholder="John Doe"
                                autoComplete="off"
                            />
                            <FieldDescription>
                                Enter your name
                            </FieldDescription>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
            </FieldSet>

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
                                Create a unique username
                            </FieldDescription>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
            </FieldSet>

            <FieldSet className='mt-3'>
                <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                            <Input
                                {...field}
                                id={field.name}
                                aria-invalid={fieldState.invalid}
                                placeholder="john.doe@email.com"
                                autoComplete="off"
                            />
                            <FieldDescription>
                                Enter a valid email
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
                                Create a strong password
                            </FieldDescription>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
            </FieldSet>

            <FieldSet className='mt-3 flex flex-row'>
                <Controller
                    name="image"
                    control={form.control}
                    render={({ field: { value, onChange, ...fieldProps }, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={fieldProps.name}>Image</FieldLabel>
                            <Input
                                {...fieldProps}
                                id={fieldProps.name}
                                aria-invalid={fieldState.invalid}
                                autoComplete="off"
                                type='file'
                                accept='image/*'
                                onChange={e => {
                                    const file = e.target.files?.[0]
                                    onChange(file ?? undefined)
                                }}
                            />
                            <FieldDescription>
                                Upload your image (optional)
                            </FieldDescription>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
                {previewUrl && (
                    <img
                        src={previewUrl}
                        alt="Profile Picture"
                        className="mt-2 h-32 w-32 object-cover rounded"
                    />
                )}

            </FieldSet>

            <Button disabled={isFormDisabled} className='mt-3' type='submit'>Signup</Button>
        </form>
    )
}
