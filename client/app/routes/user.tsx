import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React from 'react'
import { useParams } from 'react-router'
import { api } from '~/lib/axios'
import { queryKeys } from '~/lib/react-query'
import type { APIResponse } from '~/lib/types'
import { LoadingState } from '~/components/ui/spinner'

type Props = {}

function User({ }: Props) {
    const { username } = useParams()
    const { data: user, isError, isPending, error } = useQuery({
        queryKey: queryKeys.users.byUsername(username),
        queryFn: async () => {
            const res = await api.get<APIResponse>(`/api/users/${username}`)
            return res.data.data
        }
    })
    if (isPending) {
        return <LoadingState label="Loading profile..." variant="section" />;
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
