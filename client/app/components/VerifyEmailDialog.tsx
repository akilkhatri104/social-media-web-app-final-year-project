import React, { useEffect, useState } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from './ui/alert-dialog'
import { useLocation, useNavigate } from 'react-router'
import { useMe } from '~/hooks/useMe'
import ProtectedRoute from './ProtectedRoute'

type Props = {
    open?: boolean
}

function VerifyEmailDialog({ open = false }: Props) {
    const navigate = useNavigate()
    const location = useLocation()
    const [dialogOpen, setDialogOpen] = useState(open)
    const [dismissed, setDismissed] = useState(false)
    const { data, isAuth, isInitialLoading } = useMe()
    useEffect(() => {
        if (!isInitialLoading && isAuth && !data?.emailVerified && location.pathname !== '/verify-email' && !dismissed)
            setDialogOpen(true)
    }, [isAuth, location.pathname])

    if (!isAuth) return null

    return (
        <AlertDialog open={dialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Verify your email <address></address></AlertDialogTitle>
                    <AlertDialogDescription>
                        Your email is not verified, do you want to verfiy it right now?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => {
                        setDialogOpen(false)
                        setDismissed(true)
                    }}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                        navigate('/verify-email')
                        setDialogOpen(false)
                    }}>Verify Email</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default VerifyEmailDialog