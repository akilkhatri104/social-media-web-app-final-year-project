import { Link, NavLink } from "react-router";
import {
    Card,
    CardContent,
} from "~/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Heart, MessageCircle, Repeat2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import { queryClient } from "~/lib/react-query";
import type { APIResponse } from "~/lib/types";
import { toast } from "sonner";

type Props = {
    post: any;
};

const PostCard = ({ post }: Props) => {
    const likeMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post<APIResponse>(`/api/likes/${post.id}`)

            return response.data
        },
        onError: (err) => {
            toast.error(err.message)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['post'] })
            queryClient.invalidateQueries({ queryKey: ['posts'] })
            queryClient.invalidateQueries({ queryKey: ['likeStatus', post.id] })
            toast.success(data.message)

        }
    })
    const { data: likeStatus, isPending } = useQuery({
        queryFn: async () => {
            const response = await api.get<APIResponse>(`/api/likes/likeStatus/${post.id}`)
            return !!response.data.data?.likeStatus
        },
        queryKey: ['likeStatus', post.id],
    })
    return (
        <Card className="border-0 rounded-none hover:bg-muted/40 transition cursor-pointer">
            <CardContent className="flex gap-4 p-4">

                {/* Avatar */}
                <Link to={`/@${post.author.displayUsername}`}>
                    <Avatar>
                        <AvatarImage src={post?.author?.image} />
                        <AvatarFallback>
                            {post.author.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                </Link>

                {/* Content */}
                <div className="flex-1 space-y-2">

                    {/* Reply Indicator */}
                    {post.parentPostId && post.parentPost && (
                        <p className="text-sm text-muted-foreground">
                            Replying to{" "}
                            <Link
                                to={`/@${post.parentPost.author.displayUsername}`}
                                className="text-primary hover:underline"
                            >
                                @{post.parentPost.author.displayUsername}
                            </Link>
                        </p>
                    )}

                    {/* Header */}
                    <div className="flex items-center gap-2 text-sm">
                        <Link
                            to={`/@${post.author.displayUsername}`}
                            className="font-semibold hover:underline"
                        >
                            {post.author.name}
                        </Link>
                        <span className="text-muted-foreground">
                            @{post.author.displayUsername}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    {/* Post Content */}
                    <Link to={`/post/${post.id}`}>
                        <p className="text-sm whitespace-pre-wrap">
                            {post.content}
                        </p>
                    </Link>

                    {/* Media */}
                    {post.media && Array.isArray(post.media) && post.media?.length > 0 && (
                        <div
                            className={`grid gap-2 rounded-2xl overflow-hidden ${post.media.length === 1 ? "grid-cols-1" : "grid-cols-2"
                                }`}
                        >
                            {post.media.map((media: any) => (
                                <div key={media.id} className="rounded-xl overflow-hidden">
                                    {media.type === "image" ? (
                                        <img
                                            src={media.url}
                                            alt="post media"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <video
                                            controls
                                            className="w-full rounded-xl"
                                            src={media.url}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between max-w-md pt-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2 text-muted-foreground"
                            asChild
                        >
                            <NavLink to={`/post/${post.id}#reply`}>
                                <MessageCircle size={18} />
                                {post.commentCount}
                            </NavLink>
                        </Button>

                        {/* <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2 text-muted-foreground"
                        >
                            <Repeat2 size={18} />
                        </Button> */}

                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2 text-muted-foreground"
                            onClick={() => likeMutation.mutate()}
                        >
                            <Heart size={18} fill={!isPending && likeStatus ? "red" : undefined} />
                            {post.likeCount}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default PostCard;