import { Link, NavLink } from "react-router";
import {
    Card,
    CardContent,
} from "~/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
    DialogFooter
} from "~/components/ui/dialog"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "~/components/ui/carousel"
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { EllipsisVerticalIcon, Heart, MessageCircle, Repeat2, Share2Icon, Trash2Icon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import { queryClient } from "~/lib/react-query";
import type { APIResponse } from "~/lib/types";
import { toast } from "sonner";
import axios from "axios";
import { useState } from "react";
import { useMe } from "~/hooks/useMe";

type Props = {
    post: any;
};

const PostCard = ({ post }: Props) => {
    const [shareDialogOpen, setShareDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeletedDialogOpen] = useState(false)
    const { isInitialLoading, data: session, isAuth } = useMe()
    const shareAction = () => {
        navigator.clipboard.writeText(`${import.meta.env.VITE_FRONTEND_URL}/post/${post.id}`)
        setShareDialogOpen(false)
        toast.success("Post link has been copied to clipboard!")
    }
    const deleteAction = async () => {
        try {
            if (!(!isInitialLoading && isAuth) || post.userId != session.id) {
                toast.error("User either not locked in or not authorized to delete the post")
                return
            }
            toast.loading("Deleting the post...", { id: "delete-loading" })

            const res = await api.delete<APIResponse>(`/api/posts/${post.id}`)
            toast.success(res.data.message)
            queryClient.invalidateQueries({ queryKey: ['post', post.id] })
            queryClient.invalidateQueries({ queryKey: ['posts'] })
        } catch (error) {
            toast.error(axios.isAxiosError(error) ? error.response?.data.message : "Unknown error while deleting the post")
        } finally {
            toast.dismiss("delete-loading")
        }
    }
    const likeMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post<APIResponse>(`/api/likes/${post.id}`)

            return response.data
        },
        onError: (err) => {
            toast.error(axios.isAxiosError(err) ? err?.response?.data.message : "An unknown error")
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['post'] })
            queryClient.invalidateQueries({ queryKey: ['posts'] })
            queryClient.invalidateQueries({ queryKey: ['likeStatus', post.id] })
            toast.success(data.message, {
                action: {
                    label: "Undo",
                    onClick: () => likeMutation.mutate()
                }
            })

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
        <Card className="border-0 rounded-none hover:bg-card/40 transition cursor-pointer">
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
                    <div className="flex items-center justify-between gap-2 text-sm">
                        <div>
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

                        {/* Dropdown menu for Share and Delete */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <EllipsisVerticalIcon size={18} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onSelect={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setShareDialogOpen(true)
                                }}>
                                    <Share2Icon size={18} /> Share
                                </DropdownMenuItem>
                                {!isInitialLoading && isAuth && session?.id == post.userId && (
                                    <DropdownMenuItem className="text-destructive 
             data-highlighted:bg-destructive 
             data-highlighted:text-destructive-foreground" onSelect={(e) => {
                                            setDeletedDialogOpen(true)
                                        }}>
                                        <Trash2Icon /> Delete
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Dialog for Share */}
                    <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Share the post</DialogTitle>
                                <DialogDescription>
                                    Copy the link given here to share the post with your friends!
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose>Cancel</DialogClose>
                                <Button onClick={shareAction}>Share</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Dialog for Delete */}
                    {!isInitialLoading && isAuth && session?.id == post.userId && (
                        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeletedDialogOpen}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you absouloutly sure that you want to delete this post?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                {/* <AlertDialogContent>
                                <form>
                                    <input type="text" disabled value={`${import.meta.env.VITE_FRONTEND_URL}/post/${post.id}`} />
                                </form>
                            </AlertDialogContent> */}
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
                    <Link to={`/post/${post.id}`}>
                        <p className="text-sm whitespace-pre-wrap">
                            {post.content}
                        </p>
                    </Link>

                    {/* Media */}
                    {/* Media */}
                    {post.media && Array.isArray(post.media) && post.media.length > 0 && (
                        <div className="relative w-full mt-2">
                            <Carousel className="w-full">
                                <CarouselContent>
                                    {post.media.map((media: any, index: number) => (
                                        <CarouselItem key={index}>
                                            <div className="rounded-2xl overflow-hidden border">
                                                {media.type === "image" ? (
                                                    <img
                                                        src={media.url}
                                                        alt="post media"
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

                                {/* Navigation buttons */}
                                <CarouselPrevious className="left-2" />
                                <CarouselNext className="right-2" />
                            </Carousel>
                        </div>
                    )}
                    {/* {post.media && Array.isArray(post.media) && post.media?.length > 0 && (
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
                    )} */}


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