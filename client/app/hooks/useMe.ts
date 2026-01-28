import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { api } from "~/lib/axios";
import type { APIResponse } from "~/lib/types";

export const fetchCurrentUser = async () => {
    try {
        const response = await api.get<APIResponse>("/api/users/me");

        return response.data.data;
    } catch (error) {
        throw error;
    }
};

export function useMe() {
    return useQuery({
        queryKey: ["user"],
        queryFn: fetchCurrentUser,
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 min
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });
}
