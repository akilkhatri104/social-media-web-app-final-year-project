import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Loader2, Loader2Icon } from 'lucide-react'
import React from 'react'
import { useParams } from 'react-router'
import { api } from '~/lib/axios'
import type { APIResponse } from '~/lib/types'

type Props = {}

function User({ }: Props) {
    const { username } = useParams()
    const { data: user, isError, isPending, error } = useQuery({
        queryKey: ['user', username],
        queryFn: async () => {
            const res = await api.get<APIResponse>(`/api/users/${username}`)
            return res.data.data
        }
    })
    if (isPending) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin w-8 h-8 text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-destructive">{axios.isAxiosError(error) ? error.response?.data.message : error.message}</p>
            </div>
        );
    }
    return (
        <div className='flex'>

        </div >
    )
}

export default User