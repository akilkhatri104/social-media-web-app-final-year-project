import { useQuery } from "@tanstack/react-query";
import type { Route } from "./+types/hashtag.$tag";
import { api } from "~/lib/axios";
import type { APIResponse, PostDto } from "~/lib/types";
import { queryKeys } from "~/lib/react-query";
import { useDocumentTitle } from "~/lib/title";
import { Spinner } from "~/components/ui/spinner";
import PostCard from "~/components/PostCard";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { Link, useParams } from "react-router";

export function meta({ params }: Route.MetaArgs) {
    const tag = params.tag ? `#${params.tag}` : "Hashtag";
    return [
        { title: `${tag} | PU Connect` },
        { name: "description", content: `Posts for ${tag}` },
    ];
}

export default function HashtagPage() {
    const { tag } = useParams();
    const normalizedTag = tag?.toLowerCase();
    useDocumentTitle(normalizedTag ? `#${normalizedTag}` : "Hashtag");

    const { data, isPending, isError } = useQuery({
        queryKey: queryKeys.hashtags.posts(normalizedTag),
        queryFn: async () => {
            const res = await api.get<APIResponse>(`/api/hashtags/${normalizedTag}/posts`);
            return res.data.data as PostDto[];
        },
        enabled: !!normalizedTag,
    });

    if (isPending) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (isError || !normalizedTag) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-destructive">Failed to load hashtag feed</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
                <div className="flex items-center justify-between gap-3 rounded-2xl border bg-card px-5 py-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Hashtag</p>
                        <h1 className="text-2xl font-semibold">#{normalizedTag}</h1>
                    </div>
                    <Link to="/explore">
                        <Badge variant="outline">Back to Explore</Badge>
                    </Link>
                </div>

                <div className="rounded-2xl border bg-card">
                    {data && data.length > 0 ? (
                        data.map((post, index) => (
                            <div key={post.id}>
                                <PostCard post={post} />
                                {index !== data.length - 1 && <Separator />}
                            </div>
                        ))
                    ) : (
                        <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                            No posts found for this hashtag yet.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
