import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import { queryClient, queryKeys } from "~/lib/react-query";
import type { APIResponse } from "~/lib/types";

export const fetchCurrentUser = async () => {
    const response = await api.get<APIResponse>("/api/users/me", {
        validateStatus: (status) => [200, 304, 401].includes(status),
    });

    if (response.status === 304) {
        return queryClient.getQueryData(queryKeys.auth.me) ?? null;
    }

    if (response.status === 401) {
        return null;
    }

    if (response.status === 200) {
        return response.data.data.user;
    }

    return null;
};

export function useMe() {
    const query = useQuery({
        queryKey: queryKeys.auth.me,
        queryFn: fetchCurrentUser,
        staleTime: 30_000, // 30 sec: always revalidate user data on navigation/visibility
        gcTime: 60_000, // 1 minute: don't keep user cache forever
        refetchOnMount: true, // always re-check user session on mount
        refetchOnWindowFocus: true, // always re-check user session on window refocus
        retry: false,
    });

    return {
        ...query,
        isAuth: !!query.data,
        isInitialLoading: query.isPending && !query.isPaused,
    };
}
