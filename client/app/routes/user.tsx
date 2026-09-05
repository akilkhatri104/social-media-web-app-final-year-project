import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router'
import { api } from '~/lib/axios'
import { queryKeys } from '~/lib/react-query'
import type { APIResponse } from '~/lib/types'
import { LoadingState } from '~/components/ui/spinner'
import { QueryEmptyState, QueryErrorState } from '~/components/QueryState'

function User() {
    const { username } = useParams()
    const { data: user, isError, isPending } = useQuery({
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
        return <QueryErrorState message="Failed to load profile. Please try again." />;
    }

    if (!user) {
        return <QueryEmptyState label={`User "${username}" not found.`} />;
    }

    return (
        <div className="p-10">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-muted-foreground">@{user.displayUsername || user.username}</p>
            {user.bio && <p className="mt-2">{user.bio}</p>}
        </div>
    )
}

export default User
