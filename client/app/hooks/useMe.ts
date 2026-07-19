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
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: false,
    });

    return {
        ...query,
        isAuth: !!query.data,
        isInitialLoading: query.isPending && !query.isPaused,
    };
}
