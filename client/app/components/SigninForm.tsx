import * as z from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from "./ui/field"
import { api } from '~/lib/axios'
import type { APIResponse } from '~/lib/types'
import { toast } from 'sonner'
import axios from 'axios'
import { NavLink, useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { queryClient } from '~/lib/react-query'
import { useMe } from '~/hooks/useMe'
import { useEffect } from 'react'


const formSchema = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 5 characters.")
        .max(32, "Username must be at most 32 characters."),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters.")
        .max(128, "Password must be at most 128 characters."),
})

export const SigninForm = () => {
    const navigate = useNavigate()
    const { data, isError, isPending } = useMe()

    let isAuth = !!data && !isError

    useEffect(() => {
        if (isAuth) {
            toast.error("User already logged in")
            navigate('/')
        }
    }, [isAuth, navigate])


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    async function onSubmit(data: z.infer<typeof formSchema>) {
        try {
            toast('Signing in...')
            console.log(data)
            const response = await api.post<APIResponse>('/api/users/signin', data)
            console.log(response)
            if (response.status >= 400 || !response.data.success) {
                toast.error(response.data.message)
                return
            }


            toast.success(response.data.message)
            queryClient.invalidateQueries({ queryKey: ['user'] })
            navigate('/')
        } catch (error) {
            console.error(error)
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data.message)
            }
            toast.error("Unknown error")
        }

    }
    return isPending ? <h1>Loading...</h1> : (
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col p-3 bg-accent-foreground text-accent rounded-xl w-full md:w-1/3'>
            <div className='text-center'>
                <h1 className='font-bold text-lg'>Signin</h1>
                <p className='text-sm'>Don't have an account? Signup <NavLink to='signup'>here</NavLink></p>
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
                                Create a unique username
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

            <Button className='mt-3' type='submit'>Signin</Button>
        </form>
    )
}