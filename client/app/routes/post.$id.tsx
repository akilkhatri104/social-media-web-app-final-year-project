import { useParams, Link, NavLink, useLoaderData } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import PostCard from "~/components/PostCard";
import PostComposer from "../components/PostComposer";
import { Loader2 } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import type { Route } from "./+types/post.$id";
import { queryKeys } from "~/lib/react-query";
import { truncateTitleSegment, useDocumentTitle } from "~/lib/title";

export async function clientLoader({ params }: Route.ClientActionArgs) {
    try {
        const res = await api.get(`/api/posts/${params.id}`);
        return res.data.data;
    } catch (error) {
        return null
    }
}


export default function PostPage() {
    const initialData = useLoaderData<typeof clientLoader>()
    const { id } = useParams();

    const { data, isPending } = useQuery({
        queryKey: queryKeys.posts.detail(id),
        queryFn: async () => {
            const res = await api.get(`/api/posts/${id}`);
            return res.data.data;
        },
        initialData
    });

    const postTitle = isPending
        ? "Post"
        : data
            ? `Post by ${data.author.name}: ${truncateTitleSegment(data.content, 50)}`
            : "Post Not Found";

    useDocumentTitle(postTitle);

    if (isPending) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin w-8 h-8" />
            </div>
        );
    }

    if (!data) {
        return <div className="p-6">Post not found</div>;
    }

    return (
        <div className="min-h-screeno w-full bg-background">
            <div className="border-x min-h-screen">

                {/* Header */}
                {/* <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b p-4">
                    <Link to="/" className="text-primary font-semibold">
                        ← Back
                    </Link>
                </div> */}

                {/* Main Post */}
                <PostCard post={data} />

                {/* Comment Composer */}
                <PostComposer
                    parentPostId={data.id}
                    placeholder="Post your reply"
                    id="reply"
                />

                <Separator />

                {/* Comments */}
                <div>
                    {data.comments?.map((comment: any) => (
                        <div key={comment.id}>
                            <PostCard post={comment} />
                            <Separator />
                        </div>

                    ))}
                </div>

            </div>
        </div>
    );
}
