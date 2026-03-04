import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Link, useLocation, useNavigate } from 'react-router'
import { useMe } from '~/hooks/useMe'
import { X } from 'lucide-react'
import { cn } from '~/lib/utils'

type Props = {
    open?: boolean
}

function VerifyEmailDialog({ open = false }: Props) {
    const navigate = useNavigate()
    const location = useLocation()
    const [dialogOpen, setDialogOpen] = useState(open)
    const [dismissed, setDismissed] = useState(
        false
    )
    const { data, isAuth, isInitialLoading } = useMe()
    useEffect(() => {
        if (!isInitialLoading && isAuth && !data?.emailVerified && location.pathname !== '/verify-email' && !dismissed)
            setDialogOpen(true)
        else
            setDialogOpen(false)
    }, [isAuth, location.pathname, dismissed])

    if (!isAuth) return null

    return (
        <div className={cn('w-full bg-accent text-accent-foreground flex justify-between items-center p-1', {
            "hidden": !dialogOpen
        })}>
            <p>Your email is not verified, you may not be able to access some features. Do you want to verify your email</p>

            <span className='gap-2 flex'>
                <Button variant='outline' onClick={() => {
                    setDismissed(true)
                    setDialogOpen(false)
                }}>
                    <X size={12} color='white' />
                </Button>
                <Button asChild>
                    <Link to='/verify-email'>
                        Verify Email
                    </Link>
                </Button>
            </span>
        </div>
    )

}

export default VerifyEmailDialog