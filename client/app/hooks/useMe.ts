import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { api } from "~/lib/axios";
import { queryKeys } from "~/lib/react-query";
import type { APIResponse } from "~/lib/types";

export const fetchCurrentUser = async () => {
    try {
        const response = await api.get<APIResponse>("/api/users/me");

        return response.data.data.user;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            return null;
        }

        throw error;
    }
};

export function useMe() {
    const query = useQuery({
        queryKey: queryKeys.auth.me,
        queryFn: fetchCurrentUser,
    });

    return {
        ...query,
        isAuth: !!query.data,
        isInitialLoading: query.isPending && !query.isPaused,
    };
}
