import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { ImagePlus, X } from "lucide-react";
import { useMe } from "~/hooks/useMe";
import { queryKeys } from "~/lib/react-query";
import { NavLink, useNavigate } from "react-router";
import { toast } from "sonner";
import axios from "axios";
import { UserAvatar } from "./UserAvatar";
import type { APIResponse, SearchUserResult } from "~/lib/types";
import { Spinner } from "./ui/spinner";

type Props = {
    parentPostId?: number;
    placeholder?: string;
    id?: string,
    quotedPostId?: number
};

const ACTIVE_MENTION_PATTERN = /(^|\s)@([a-zA-Z0-9_]{0,30})$/;

function getActiveMention(content: string) {
    const match = content.match(ACTIVE_MENTION_PATTERN);
    return match?.[2] ?? null;
}

export default function PostComposer({
    parentPostId,
    placeholder = "What's happening?",
    id = 'post',
    quotedPostId
}: Props) {
    const queryClient = useQueryClient();
    const [content, setContent] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const { isAuth, isInitialLoading, data } = useMe()
    const navigate = useNavigate()
    const activeMention = getActiveMention(content);

    const { data: mentionUsers = [] } = useQuery({
        queryKey: queryKeys.explore.search(activeMention ? `mention:${activeMention}` : "mention:"),
        queryFn: async () => {
            const res = await api.get<APIResponse>("/api/explore/search", {
                params: { q: activeMention, limit: 5 },
            });
            return (res.data.data?.users ?? []) as SearchUserResult[];
        },
        enabled: activeMention !== null && activeMention.length > 0,
    });

    const insertMention = (handle: string) => {
        setContent((current) => current.replace(ACTIVE_MENTION_PATTERN, `$1@${handle} `));
    };

    const mutation = useMutation({
        mutationFn: async () => {
            toast.loading("Posting...", { id: "post-loading" })
            const formData = new FormData();
            formData.append("content", content);
            if (parentPostId) {
                formData.append("parentPostId", String(parentPostId));
            }

            if (quotedPostId) {
                formData.append("quotedPostId", String(quotedPostId))
            }

            files.forEach((file) => {
                formData.append("media", file);
            });

            await api.post("/api/posts", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        },
        onError: (err) => {
            if (axios.isAxiosError(err)) {
                if (err.response?.status == 402) {
                    toast.error(err.response.data.message, {
                        action: {
                            label: "Verify Email",
                            onClick: () => {
                                navigate('/verify-email')
                            }
                        }
                    })
                }
            } else {
                toast.error("Unknown Error")
            }
        },
        onSuccess: () => {
            setContent("");
            setFiles([]);
            queryClient.invalidateQueries({ queryKey: queryKeys.posts.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.hashtags.trending });
            queryClient.invalidateQueries({ queryKey: queryKeys.explore.summary });
            navigate(`/`)
            toast.success("Posted Successfully")
        },
        onSettled: () => {
            toast.dismiss("post-loading")
        }

    });

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    return !isInitialLoading && !isAuth ? <div className="flex gap-4 p-4 border-b"><NavLink className='hover:underline text-accent-foreground' to='/signin'>Signin</NavLink>or<NavLink className='hover:underline text-accent-foreground' to='/signup'>Signup</NavLink> to make your post!</div> : (
        <div className="flex gap-4 p-4 border-b" id={id}>
            <NavLink to={`/@${data?.displayUsername}`}>
                <UserAvatar
                    image={data?.image}
                    name={data?.name}
                    displayUsername={data?.displayUsername}
                    className="cursor-pointer"
                />
            </NavLink>

            <div className="flex-1 space-y-3">
                <Textarea
                    placeholder={placeholder}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="resize-none border-none focus-visible:ring-0 text-lg"
                />

                {activeMention !== null && mentionUsers.length > 0 && (
                    <div className="overflow-hidden rounded-xl border bg-popover shadow-sm">
                        {mentionUsers.map((user) => {
                            const handle = user.displayUsername ?? user.username;

                            if (!handle) return null;

                            return (
                                <button
                                    key={user.id}
                                    type="button"
                                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-accent"
                                    onClick={() => insertMention(handle)}
                                >
                                    <UserAvatar
                                        image={user.image}
                                        name={user.name}
                                        username={user.username}
                                        displayUsername={user.displayUsername}
                                        className="h-8 w-8"
                                    />
                                    <span className="min-w-0">
                                        <span className="block truncate font-medium">{user.name}</span>
                                        <span className="block truncate text-xs text-muted-foreground">@{handle}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Media Preview */}
                {files.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                        {files.map((file, index) => (
                            <div key={index} className="relative">
                                {file.type.startsWith("image") ? (
                                    <img
                                        src={URL.createObjectURL(file)}
                                        className="rounded-xl object-cover w-full"
                                    />
                                ) : (
                                    <video
                                        src={URL.createObjectURL(file)}
                                        controls
                                        className="rounded-xl"
                                    />
                                )}
                                <button
                                    onClick={() => removeFile(index)}
                                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex justify-between items-center">
                    <label className="cursor-pointer text-primary flex items-center gap-2">
                        <ImagePlus size={20} />
                        <input
                            type="file"
                            multiple
                            hidden
                            onChange={(e) => {
                                if (e.target.files) {
                                    setFiles([...files, ...Array.from(e.target.files)]);
                                }
                            }}
                        />
                    </label>

                    <Button
                        onClick={() => mutation.mutate()}
                        disabled={!content || mutation.isPending}
                        className="rounded-full"
                    >
                        {mutation.isPending ? (
                            <Spinner className="size-4 text-current" />
                        ) : parentPostId ? (
                            "Reply"
                        ) : (
                            "Post"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
