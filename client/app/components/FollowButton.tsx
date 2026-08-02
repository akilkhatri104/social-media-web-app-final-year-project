import { useMe } from "~/hooks/useMe"
import { Button } from "./ui/button"
import { Spinner } from "./ui/spinner"
import { queryClient, queryKeys } from "~/lib/react-query"
import { useMutation, useQuery } from "@tanstack/react-query"
import { api } from "~/lib/axios"
import type { APIResponse } from "~/lib/types"
import { useState } from "react"
import { toast } from "sonner"
import axios from "axios"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { NavLink } from "react-router"

type Props = {
    userId: string,
    className?: string
}

function FollowButton({ userId, className }: Props) {
    const { isInitialLoading, isAuth, data: user } = useMe()
    const viewerId = user?.id
    const isGuest = !isInitialLoading && !isAuth
    const isSelf = isAuth && String(viewerId ?? "") === String(userId ?? "")
    const [authDialogOpen, setAuthDialogOpen] = useState(false)
    const [isFollowButtonDisabled, setIsFollowButtonDisabled] = useState(false)

    const { data: isFollowing } = useQuery({
        queryKey: queryKeys.follow.status(userId),
        enabled: isAuth && !!viewerId && viewerId !== userId,
        queryFn: async () => {

            const res = await api.get<APIResponse>(`/api/follow/status/${userId}`)
            return res.data.data?.isFollowing
        }
    })

    const { mutate: followMutation } = useMutation({
        mutationFn: async () => {

            const res = await api.post<APIResponse>(`/api/follow/${userId}`)
            return res.data
        },
        onSuccess: (data) => {
            toast.success(data.message, {
                action: {
                    label: "Undo",
                    onClick: handleClick
                }
            })
            queryClient.invalidateQueries({ queryKey: queryKeys.follow.status(userId) })
            queryClient.invalidateQueries({ queryKey: queryKeys.follow.following(viewerId) })
            queryClient.invalidateQueries({ queryKey: queryKeys.follow.followers(userId) })
        },
        onError: (e) => {
            if (axios.isAxiosError(e)) {
                if (e.status == 401) {
                    queryClient.invalidateQueries({ queryKey: queryKeys.auth.me })
                    setAuthDialogOpen(true)
                } else {
                    toast.error(e.response?.data.message)
                }
            } else {
                toast.error("Unknown server error")
            }
        },
        onSettled: () => {
            toast.dismiss("follow-loading")
            setIsFollowButtonDisabled(false)
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.feed("following") })
            queryClient.invalidateQueries({ queryKey: ["followerCount"] })
            queryClient.invalidateQueries({ queryKey: ["followingCount"] })
            queryClient.invalidateQueries({ queryKey: ["followersList"] })
            queryClient.invalidateQueries({ queryKey: ["followingList"] })
        }
    })

    const handleClick = () => {
        if (isGuest) {
            setAuthDialogOpen(true)
            return
        }

        if (isSelf) {
            return
        }

        setIsFollowButtonDisabled(true)
        if (isFollowing) {
            toast.loading("Unfollowing user...", { id: "follow-loading" })
        } else {
            toast.loading("Following user...", { id: "follow-loading" })
        }

        followMutation()
    }

    if (isInitialLoading) {
        return <Button disabled className={className}>
            <Spinner />
        </Button>
    }

    if (isSelf) {
        return null
    }

    return (
        <>
            <Button
                disabled={isFollowButtonDisabled}
                onClick={handleClick}
                variant={isFollowing ? "outline" : "default"}
                className={className}
            >
                {isFollowing ? "Following" : "Follow"}
            </Button>

            <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Sign in to follow users</DialogTitle>
                        <DialogDescription>
                            Create an account or sign in to follow this user.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button asChild variant="outline">
                            <NavLink to="/signin">Signin</NavLink>
                        </Button>
                        <Button asChild>
                            <NavLink to="/signup">Signup</NavLink>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default FollowButton
