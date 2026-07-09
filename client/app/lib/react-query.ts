import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export const queryKeys = {
    auth: {
        me: ["auth", "me"] as const,
    },
    users: {
        byUsername: (username?: string) =>
            ["users", "by-username", username] as const,
    },
    posts: {
        all: ["posts"] as const,
        feed: (tab: string) => ["posts", "feed", tab] as const,
        detail: (id?: string | number) => ["posts", "detail", id] as const,
        likeStatus: (id?: string | number) =>
            ["posts", "like-status", id] as const,
        byUserId: (userId?: string | number) =>
            ["posts", "users", userId] as const,
    },
    explore: {
        summary: ["explore", "summary"] as const,
    },
    hashtags: {
        trending: ["hashtags", "trending"] as const,
        posts: (tag?: string) => ["hashtags", "posts", tag] as const,
    },
    follow: {
        followers: (userId: string) => ["followers", userId] as const,
        following: (userId: string) => ["following", userId] as const,
        status: (userId: string) => ["follow", "status", userId],
    },
    repost: {
        status: (id?: string | number) => ["repost", "status", id] as const,
    },
    bookmarks: {
        all: ["bookmarks"] as const,
        status: (id?: string | number) => ["bookmarks", "status", id] as const,
    },
};
