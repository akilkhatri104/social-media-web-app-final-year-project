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

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
    name: z
        .string()
        .min(4, "Name must be at least 4 characters.")
        .max(32, "Name must be at most 32 characters."),
    username: z
        .string()
        .min(5, "Username must be at least 5 characters.")
        .max(32, "Username must be at most 32 characters."),
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
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    function onSubmit(data: z.infer<typeof formSchema>) {
        console.log(data)
    }
    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col p-3 bg-accent-foreground text-accent rounded-xl'>
            <h1>Signup</h1>

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
                            />
                            <FieldDescription>
                                Create a strong password
                            </FieldDescription>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
            </FieldSet>

            <FieldSet className='mt-3'>
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
                                value=""
                                onChange={e => form.setValue('image', e.target.files?.[0] ?? undefined)}
                            />
                            <FieldDescription>
                                Upload your image (optional)
                            </FieldDescription>
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
            </FieldSet>

            <Button className='mt-3' type='submit'>Signup</Button>
        </form>
    )
}