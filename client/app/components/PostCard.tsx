import { Link } from "react-router";
import {
    Card,
    CardContent,
} from "~/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
    DialogFooter
} from "~/components/ui/dialog";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "~/components/ui/carousel";

import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Pencil, Bookmark, EllipsisVerticalIcon, Heart, MessageCircle, Repeat2, Share2Icon, Trash2Icon } from "lucide-react";
import { Button } from "~/components/ui/button";

import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import { queryClient, queryKeys } from "~/lib/react-query";
import type { APIResponse } from "~/lib/types";
import { toast } from "sonner";
import axios from "axios";
import { useState } from "react";
import { useMe } from "~/hooks/useMe";
import PostComposer from "./PostComposer";
import FollowButton from "./FollowButton";
import { cn } from "~/lib/utils";
import { QuotedPostEmbed } from "./QuotedPostEmbed";

type Props = {
    post: any;
};

const PostCard = ({ post }: Props) => {
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeletedDialogOpen] = useState(false);
    const [repostDialogOpen, setRepostDialogOpen] = useState(false);

    const { isInitialLoading, data: session, isAuth } = useMe();

    const author = post?.author;
    const parentAuthor = post?.parentPost?.author;

    const shareAction = () => {
        navigator.clipboard.writeText(
            `${import.meta.env.VITE_FRONTEND_URL}/post/${post?.id}`
        );
        setShareDialogOpen(false);
        toast.success("Post link has been copied to clipboard!");
    };

    const deleteAction = async () => {
        try {
            if (!(!isInitialLoading && isAuth) || post?.userId != session?.id) {
                toast.error("User either not logged in or not authorized");
                return;
            }

            toast.loading("Deleting the post...", { id: "delete-loading" });

            const res = await api.delete<APIResponse>(`/api/posts/${post.id}`)
            toast.success(res.data.message)
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.all })
            queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all })
        } catch (error) {
            toast.error(
                axios.isAxiosError(error)
                    ? error.response?.data.message
                    : "Unknown error while deleting the post"
            );
        } finally {
            toast.dismiss("delete-loading");
        }
    };

    const likeMutation = useMutation({
        mutationFn: async () => {
            toast.loading(
                !!likeStatus ? "Unliking post..." : "Liking Post",
                { id: "like-loading" }
            );
            const response = await api.post<APIResponse>(`/api/likes/${post.id}`);
            return response.data;
        },
        onError: (err) => {
            toast.error(
                axios.isAxiosError(err)
                    ? err?.response?.data.message
                    : "An unknown error"
            );
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
            toast.success(data.message, {
                action: {
                    label: "Undo",
                    onClick: () => likeMutation.mutate()
                }
            });
        },
        onSettled: () => {
            toast.dismiss("like-loading");
        }
    });

    const repostMutation = useMutation({
        mutationFn: async () => {
            if (repostStatus) {
                toast.loading("Unreposting post...", { id: "repost-loading" });
            } else {
                toast.loading("Reposting post...", { id: "repost-loading" });
            }
            const response = await api.post<APIResponse>(`/api/repost/${post.id}`);
            return response.data;
        },
        onError: (err) => {
            toast.error(
                axios.isAxiosError(err) ? err?.response?.data.message : "An unknown error"
            );
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.repost.status(post.id) });
            toast.success(data.message, {
                action: {
                    label: "Undo",
                    onClick: () => repostMutation.mutate()
                }
            });
        },
        onSettled: () => {
            toast.dismiss("repost-loading");
        }
    });

    const { data: likeStatus, isPending } = useQuery({
        queryFn: async () => {
            const response = await api.get<APIResponse>(`/api/likes/likeStatus/${post?.id}`);
            return !!response.data.data?.likeStatus;
        },
        queryKey: queryKeys.posts.likeStatus(post.id),
        enabled: !isInitialLoading && isAuth,
    })

    const { data: repostStatus, isPending: isRepostStatusPending } = useQuery({
        queryFn: async () => {
            const response = await api.get<APIResponse>(`/api/repost/status/${post?.id}`);
            return !!response.data.data?.reposted;
        },
        queryKey: queryKeys.repost.status(post.id),
        enabled: !isInitialLoading && isAuth,
    })

    const { data: bookmarkStatus } = useQuery({
        queryFn: async () => {
            const response = await api.get<APIResponse>(`/api/bookmarks/status/${post.id}`)
            return !!response.data.data?.bookmarked
        },
        queryKey: queryKeys.bookmarks.status(post.id),
        enabled: !isInitialLoading && isAuth,
    })

    const bookmarkMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post<APIResponse>(`/api/bookmarks/${post.id}`)
            return response.data
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: queryKeys.bookmarks.status(post.id) })
            const previousStatus = queryClient.getQueryData<boolean>(queryKeys.bookmarks.status(post.id))
            queryClient.setQueryData(queryKeys.bookmarks.status(post.id), !previousStatus)
            toast.loading(previousStatus ? "Removing bookmark..." : "Bookmarking post...", { id: "bookmark-loading" })
            return { previousStatus }
        },
        onError: (err, _, context) => {
            queryClient.setQueryData(queryKeys.bookmarks.status(post.id), context?.previousStatus)
            toast.error(axios.isAxiosError(err) ? err?.response?.data.message : "An unknown error")
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.status(post.id) })
            queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all })
            toast.success(data.message)
        },
        onSettled: () => {
            toast.dismiss("bookmark-loading")
        }
    })

    return (
        <Card className="border-0 rounded-none hover:bg-card/40 transition cursor-pointer">
            <CardContent className="flex gap-4 p-4">

                {/* Avatar */}
                <Link to={`/@${author?.displayUsername}`}>
                    <Avatar>
                        <AvatarImage src={author?.image} />
                        <AvatarFallback>
                            {author?.name?.charAt(0) ?? "U"}
                        </AvatarFallback>
                    </Avatar>
                </Link>

                {/* Content */}
                <div className="flex-1 space-y-2">

                    {/* Reply Indicator */}
                    {post?.parentPostId && parentAuthor && (
                        <p className="text-sm text-muted-foreground">
                            Replying to{" "}
                            <Link
                                to={`/@${parentAuthor.displayUsername}`}
                                className="text-primary hover:underline"
                            >
                                @{parentAuthor.displayUsername}
                            </Link>
                        </p>
                    )}

                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 text-sm">
                        <div>
                            <Link
                                to={`/@${author?.displayUsername ?? ""}`}
                                className="font-semibold hover:underline"
                            >
                                {author?.name ?? "Unknown"}
                            </Link>
                            <span className="ml-2 text-muted-foreground">
                                @{post.author.displayUsername}
                            </span>
                            <span className="mx-3 text-muted-foreground">·</span>
                            <span className="text-muted-foreground">
                                {post?.createdAt
                                    ? new Date(post.createdAt).toLocaleDateString()
                                    : ""}
                            </span>
                        </div>

                        {/* Follow + Dropdown */}
                        <div className="flex justify-center items-center">
                            <FollowButton userId={post.author.id} />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <EllipsisVerticalIcon size={18} />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem
                                        onSelect={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setShareDialogOpen(true);
                                        }}
                                    >
                                        <Share2Icon size={18} /> Share
                                    </DropdownMenuItem>
                                    {!isInitialLoading && isAuth && session?.id == post.userId && (
                                        <DropdownMenuItem
                                            className="text-destructive data-highlighted:bg-destructive data-highlighted:text-destructive-foreground"
                                            onSelect={() => setDeletedDialogOpen(true)}
                                        >
                                            <Trash2Icon /> Delete
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Share Dialog */}
                    <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Share the post</DialogTitle>
                                <DialogDescription>
                                    Copy the link to share this post
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose>Cancel</DialogClose>
                                <Button onClick={shareAction}>Share</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Delete Dialog */}
                    {!isInitialLoading && isAuth && session?.id == post.userId && (
                        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeletedDialogOpen}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you absolutely sure that you want to delete this post?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={deleteAction} asChild>
                                        <Button variant='destructive'>Yes, Delete</Button>
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}

                    {/* Post Content */}
                    <Link to={`/post/${post?.id}`}>
                        <p className="text-sm whitespace-pre-wrap">
                            {post?.content}
                        </p>
                    </Link>

                    {/* Media */}
                    {post?.media && Array.isArray(post.media) && post.media.length > 0 && (
                        <div className="relative w-full mt-2">
                            <Carousel className="w-full">
                                <CarouselContent>
                                    {post.media.map((media: any, index: number) => (
                                        <CarouselItem key={index}>
                                            <div className="rounded-2xl overflow-hidden border">
                                                {media.type === "image" ? (
                                                    <img
                                                        src={media.url}
                                                        className="w-full max-h-[500px] object-cover"
                                                    />
                                                ) : (
                                                    <video
                                                        controls
                                                        className="w-full max-h-[500px] object-cover"
                                                        src={media.url}
                                                    />
                                                )}
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious className="left-2" />
                                <CarouselNext className="right-2" />
                            </Carousel>
                        </div>
                    )}

                    {(post.quotedPost || post.quotedPostId) && (
                        <QuotedPostEmbed post={post.quotedPost} />
                    )}

                    {/* Actions */}
                    <div className="flex justify-between p-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-2 text-muted-foreground"
                                >
                                    <MessageCircle size={18} />
                                    {post?.commentCount ?? 0}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Post a reply</DialogTitle>
                                </DialogHeader>
                                <PostComposer parentPostId={post?.id} />
                            </DialogContent>
                        </Dialog>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={repostMutation.isPending}
                                    className={cn('flex items-center text-muted-foreground gap-2', {
                                        "text-primary": !!repostStatus
                                    })}
                                >
                                    <Repeat2 size={18} />
                                    {post.repostCount}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => repostMutation.mutate()}>
                                    <Repeat2 /> {!!repostStatus ? "Unrepost" : "Repost"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setRepostDialogOpen(true)}>
                                    <Pencil /> Quote Repost
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Dialog open={repostDialogOpen} onOpenChange={setRepostDialogOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Post a quote repost</DialogTitle>
                                </DialogHeader>
                                <PostComposer quotedPostId={post?.id} />
                            </DialogContent>
                        </Dialog>

                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={likeMutation.isPending}
                            className="flex items-center gap-2 text-muted-foreground"
                            onClick={() => {
                                likeMutation.mutate()
                            }}
                        >
                            <Heart size={18} fill={!!likeStatus ? "red" : undefined} />
                            {post.likeCount}
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={bookmarkMutation.isPending}
                            className={cn('flex items-center text-muted-foreground gap-2', {
                                "text-primary": !!bookmarkStatus
                            })}
                            onClick={() => {
                                if (!isAuth) {
                                    toast.error("Please sign in to bookmark posts")
                                    return
                                }
                                bookmarkMutation.mutate()
                            }}
                        >
                            <Bookmark size={18} fill={bookmarkStatus ? "currentColor" : "none"} />
                        </Button>
                    </div>

                </div>

            </CardContent>

        </Card>
    );
};

export default PostCard;