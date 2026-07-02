import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { api } from "~/lib/axios";
import axios from "axios";
import { toast } from "sonner";

export function ForgotPasswordForm() {
  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');
  const [email,setEmail] = useState('')
  const [otp,setOtp] = useState('')
  const [password,setPassword] = useState('')
  const [confirmPassword,setConfirmPassword] = useState('')
  const [isFormDisabled,setIsFormDisabled] = useState(false) 

  const onEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsFormDisabled(true)
    toast.loading('Sending password reset OTP...',{
      id: 'password-reset-email'
    })
    try{
      const res = await api.post('/api/users/forget-password/send',{email})

      toast.success(res.data.message)
      setStep('otp')
    }catch(error){
      console.error(error)
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data.message)
            } else
                toast.error("Unknown Error")
    }finally{
      toast.dismiss('password-reset-email')
      setIsFormDisabled(false)
    }
  }

  const onOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsFormDisabled(true)
    toast.loading('Verifying OTP...',{
      id: 'password-reset-otp'
    })
    try{
      if(password !== confirmPassword){
        toast.error('Passwords do not match')
        setIsFormDisabled(false)
        return
      }
      const res = await api.post('/api/users/forget-password/verify',{email,otp,password})

      toast.success(res.data.message)
      setStep('success')
    }catch(error){
      console.error(error)
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data.message)
            } else
                toast.error("Unknown Error")
    }finally{
      toast.dismiss('password-reset-otp')
      setIsFormDisabled(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center bg-card text-card-foreground p-8 rounded-lg shadow-md w-full max-w-md">
      <hgroup className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-4">Forgot Password</h1>
      <p className="text-gray-600 mb-6">Enter your email address and we'll send you a link to reset your password.</p>
      </hgroup>

      {step === 'email' && (
        <form className="w-full" onSubmit={onEmail}>
          <div className="mb-4">
            <Label htmlFor="email" className="">Email</Label>
            <Input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" disabled={isFormDisabled} />
          </div>
          <Button type="submit" className="w-full py-2 px-4"disabled={isFormDisabled} >Send Reset Link</Button>
        </form>
      )}

      {step === 'otp' && (
        <form className="w-full" onSubmit={onOtp}>
          <div className="mb-4">
            <Label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</Label>
            <Input type="text" id="otp" name="otp" value={otp} onChange={(e) => setOtp(e.target.value)} minLength={6} maxLength={6} required className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" />
            <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 mt-4">New Password</Label>
            <Input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" />
            <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 mt-4">Confirm New Password</Label>
            <Input type="password" id="confirmPassword" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" />
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-600">We have sent an OTP to your email address. Please check your inbox and enter the OTP to reset your password.</p>
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-600">If you didn't receive the email, please check your spam folder or try again.</p>
          </div>
          <Button type="submit" className="w-full py-2 px-4"disabled={isFormDisabled} >Verify OTP</Button>
        </form>
      )}

      {step == 'success' && (
        <div>
          <p>You have successfully reset your password!</p>
          <Button asChild>
            <a href="/signin">Signin</a>
          </Button>
        </div>
      )}
    </div>
  );
}
