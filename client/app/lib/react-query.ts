import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export const queryKeys = {
    auth: {
        me: ["auth", "me"] as const,
    },
    users: {
        byUsername: (username?: string) => ["users", "by-username", username] as const,
    },
    posts: {
        all: ["posts"] as const,
        feed: (tab: string) => ["posts", "feed", tab] as const,
        detail: (id?: string | number) => ["posts", "detail", id] as const,
        likeStatus: (id?: string | number) => ["posts", "like-status", id] as const,
    },
};
