import React from 'react'
import { Button } from './ui/button'
import axios from 'axios'
import { toast } from 'sonner'
import { api } from '~/lib/axios'
import type { APIResponse } from '~/lib/types'
import { useNavigate } from 'react-router'
import { queryClient } from '~/lib/react-query'

const LogoutButton = () => {
    const navigate = useNavigate()
    async function logoutHandler() {
        try {
            toast("Logging out....")
            const response = await api.post<APIResponse>('/api/users/logout')
            if (response.status >= 400) {
                toast.error(response.data.message)
            }

            toast.success(response.data.message)
            queryClient.invalidateQueries({ queryKey: ['user'] })
            navigate('/')
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data.message)
            } else
                toast.error("Unknown error has occured")
        }
    }
    return (
        <Button onClick={logoutHandler}>Logout</Button>
    )
}

export default LogoutButton