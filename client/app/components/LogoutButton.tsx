import { Button } from './ui/button'
import axios from 'axios'
import { toast } from 'sonner'
import { api } from '~/lib/axios'
import type { APIResponse } from '~/lib/types'
import { useNavigate } from 'react-router'
import { queryClient, queryKeys } from '~/lib/react-query'

type Props = {
    variant?: "link" | "default" | "outline" | "secondary" | "ghost" | "destructive" | null | undefined
}

const LogoutButton = ({ variant }: Props) => {
    const navigate = useNavigate()
    async function logoutHandler() {
        try {
            toast.loading("Logging out....", {
                id: 'logout-loading'
            })
            const response = await api.post<APIResponse>('/api/users/logout')
            if (response.status >= 400) {
                toast.error(response.data.message)
            }

            sessionStorage.clear()
            toast.success(response.data.message)
            queryClient.setQueryData(queryKeys.auth.me, null)
            navigate('/')
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data.message)
            } else
                toast.error("Unknown error has occured")
        } finally {
            toast.dismiss('logout-loading')
        }
    }
    return (
        <Button variant={variant} onClick={logoutHandler}>Logout</Button>
    )
}

export default LogoutButton
