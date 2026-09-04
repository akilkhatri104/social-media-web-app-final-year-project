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

const formSchema = z.object({
  username: z.string(),
  password: z.string(),
})

export const SigninForm = () => {
  const navigate = useNavigate()

  const [isFormDisabled, setIsFormDisabled] = useState(false)

  const [mfaRequired, setMfaRequired] = useState(false)
  const [otp, setOtp] = useState('')

  const [securityChallengeRequired, setSecurityChallengeRequired] =
    useState(false)
  const [securityAnswer, setSecurityAnswer] = useState('')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      setIsFormDisabled(true)
      toast.loading('Signing in...', { id: 'signin-loading' })

      const response = await api.post<APIResponse>(
        '/api/users/signin',
        data,
      )

      if (response.status >= 400 || !response.data.success) {
        toast.error(response.data.message)
        return
      }

      const responseData = response.data.data as {
        user?: unknown
        mfaRequired?: boolean
        securityChallengeRequired?: boolean
        challengeQuestion?: string
        riskLevel?: string
      }

      // MEDIUM risk
      if (responseData.mfaRequired) {
        setMfaRequired(true)
        toast.success('OTP sent to your registered email')
        return
      }

      // HIGH risk
      if (responseData.securityChallengeRequired) {
        setSecurityChallengeRequired(true)
        toast.success('Additional security verification required')
        return
      }

      // LOW risk
      if (!responseData.user) {
        throw new Error('Signin succeeded but no user was returned')
      }

      queryClient.setQueryData(
        queryKeys.auth.me,
        responseData.user,
      )

      toast.success(response.data.message)
      navigate('/home', { replace: true })
    } catch (error) {
      console.error(error)

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ??
          error.message ??
          'Unable to sign in',
        )
      } else if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Unknown error')
      }
    } finally {
      setIsFormDisabled(false)
      toast.dismiss('signin-loading')
    }
  }

  async function verifyOTP() {
    try {
      if (otp.length !== 6) {
        toast.error('Enter the 6-digit OTP')
        return
      }

      setIsFormDisabled(true)
      toast.loading('Verifying OTP...', { id: 'otp-loading' })

      const response = await api.post<APIResponse>(
        '/api/users/signin/verify-otp',
        { otp },
      )

      if (response.status >= 400 || !response.data.success) {
        toast.error(response.data.message)
        return
      }

      const responseData = response.data.data as {
        user?: unknown
      }

      if (!responseData.user) {
        throw new Error('OTP verified but no user was returned')
      }

      queryClient.setQueryData(
        queryKeys.auth.me,
        responseData.user,
      )

      toast.success('Signin successful')
      navigate('/home', { replace: true })
    } catch (error) {
      console.error(error)

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ??
          error.message ??
          'Unable to verify OTP',
        )
      } else if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Unknown error')
      }
    } finally {
      setIsFormDisabled(false)
      toast.dismiss('otp-loading')
    }
  }

  async function verifySecurityChallenge() {
    try {
      if (!securityAnswer.trim()) {
        toast.error('Enter your answer')
        return
      }

      setIsFormDisabled(true)

      toast.loading(
        'Verifying security challenge...',
        { id: 'security-loading' },
      )

      const response = await api.post<APIResponse>(
        '/api/users/signin/verify-security',
        {
          answer: securityAnswer,
        },
      )

      if (response.status >= 400 || !response.data.success) {
        toast.error(response.data.message)
        return
      }

      const responseData = response.data.data as {
        user?: unknown
      }

      if (!responseData.user) {
        throw new Error(
          'Security verification succeeded but no user was returned',
        )
      }

      queryClient.setQueryData(
        queryKeys.auth.me,
        responseData.user,
      )

      toast.success('Signin successful')
      navigate('/home', { replace: true })
    } catch (error) {
      console.error(error)

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ??
          error.message ??
          'Unable to verify security challenge',
        )
      } else if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Unknown error')
      }
    } finally {
      setIsFormDisabled(false)
      toast.dismiss('security-loading')
    }
  }

  // HIGH-RISK SECURITY CHALLENGE SCREEN
  if (securityChallengeRequired) {
    return (
      <div className='flex flex-col p-3 bg-card text-card-foreground rounded-xl w-full md:w-1/3'>
        <div className='text-center'>
          <h1 className='font-bold text-lg'>
            Additional Verification
          </h1>

          <p className='text-sm mt-2'>
            This login was detected as high risk.
          </p>

          <p className='text-sm mt-2'>
            What is your favorite animal?
          </p>
        </div>

        <FieldSet className='mt-4'>
          <Field>
            <FieldLabel htmlFor='security-answer'>
              Security Answer
            </FieldLabel>

            <Input
              id='security-answer'
              value={securityAnswer}
              onChange={(event) =>
                setSecurityAnswer(event.target.value)
              }
              placeholder='Enter your answer'
              autoComplete='off'
            />

            <FieldDescription>
              Enter your security challenge answer.
            </FieldDescription>
          </Field>
        </FieldSet>

        <Button
          className='mt-3'
          type='button'
          disabled={isFormDisabled}
          onClick={verifySecurityChallenge}
        >
          Verify
        </Button>
      </div>
    )
  }

  // MEDIUM-RISK OTP SCREEN
  if (mfaRequired) {
    return (
      <div className='flex flex-col p-3 bg-card text-card-foreground rounded-xl w-full md:w-1/3'>
        <div className='text-center'>
          <h1 className='font-bold text-lg'>
            Verify Login
          </h1>

          <p className='text-sm mt-2'>
            A verification code has been sent to your registered email.
          </p>
        </div>

        <FieldSet className='mt-4'>
          <Field>
            <FieldLabel htmlFor='signin-otp'>
              OTP
            </FieldLabel>

            <Input
              id='signin-otp'
              value={otp}
              onChange={(event) =>
                setOtp(
                  event.target.value
                    .replace(/\D/g, '')
                    .slice(0, 6),
                )
              }
              placeholder='Enter 6-digit OTP'
              inputMode='numeric'
              autoComplete='one-time-code'
            />

            <FieldDescription>
              Enter the 6-digit code from your email.
            </FieldDescription>
          </Field>
        </FieldSet>

        <Button
          className='mt-3'
          type='button'
          disabled={isFormDisabled}
          onClick={verifyOTP}
        >
          Verify OTP
        </Button>
      </div>
    )
  }

  // NORMAL SIGN-IN SCREEN
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className='flex flex-col p-3 bg-card text-card-foreground rounded-xl w-full md:w-1/3'
    >
      <div className='text-center'>
        <h1 className='font-bold text-lg'>
          Signin
        </h1>

        <p className='text-sm'>
          Don't have an account? Signup{' '}
          <NavLink
            to='/signup'
            className='text-blue-300'
          >
            here
          </NavLink>
        </p>

        <p className='text-sm mt-2'>
          <NavLink
            to='/forgot-password'
            className='text-blue-500 underline'
          >
            Forgot Password?
          </NavLink>
        </p>
      </div>

      <FieldSet className='mt-3'>
        <Controller
          name='username'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Username
              </FieldLabel>

              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder='john.doe'
                autoComplete='off'
              />

              <FieldDescription>
                Enter your username or email
              </FieldDescription>

              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </FieldSet>

      <FieldSet className='mt-3'>
        <Controller
          name='password'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Password
              </FieldLabel>

              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder='John@123456'
                autoComplete='off'
                type='password'
              />

              <FieldDescription>
                Enter your password
              </FieldDescription>

              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </FieldSet>

      <Button
        className='mt-3'
        type='submit'
        disabled={isFormDisabled}
      >
        Signin
      </Button>
    </form>
  )
}