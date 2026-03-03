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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "~/components/ui/dialog"
import { Button } from './ui/button'
import { useLocation, useNavigate } from 'react-router'
import { useMe } from '~/hooks/useMe'

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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Verify your email <address></address></DialogTitle>
                    <DialogDescription>
                        Your email is not verified, do you want to verfiy it right now?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose onClick={() => {
                        setDialogOpen(false)
                        setDismissed(true)
                    }}>Cancel</DialogClose>
                    <Button onClick={() => {
                        navigate('/verify-email')
                        setDialogOpen(false)
                    }}>Verify Email</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default VerifyEmailDialog