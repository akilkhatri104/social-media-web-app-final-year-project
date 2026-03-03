import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useMe } from "~/hooks/useMe";
import { NavLink, useNavigate } from "react-router";
import { toast } from "sonner";
import axios from "axios";

type Props = {
    parentPostId?: number;
    placeholder?: string;
    id?: string
};

export default function PostComposer({
    parentPostId,
    placeholder = "What's happening?",
    id = 'post'
}: Props) {
    const queryClient = useQueryClient();
    const [content, setContent] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const { isAuth, isInitialLoading, data } = useMe()
    const navigate = useNavigate()

    const mutation = useMutation({
        mutationFn: async () => {
            try {
                toast.loading("Posting...", { id: "post-loading" })
                const formData = new FormData();
                formData.append("content", content);
                if (parentPostId) {
                    formData.append("parentPostId", String(parentPostId));
                }

                files.forEach((file) => {
                    formData.append("media", file);
                });

                await api.post("/api/posts", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } catch (error) {
                toast.error(axios.isAxiosError(error) ? error.response?.data.message : "Unknown error")
            } finally {
                toast.dismiss("post-loading")
            }
        },
        onSuccess: () => {
            setContent("");
            setFiles([]);
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["post"] });
            navigate(`/`)
            toast.success("Posted Successfully")
        },
    });

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    return !isInitialLoading && !isAuth ? <div className="flex gap-4 p-4 border-b"><NavLink className='hover:underline text-accent-foreground' to='/signin'>Signin</NavLink>or<NavLink className='hover:underline text-accent-foreground' to='/signup'>Signup</NavLink> to make your post!</div> : (
        <div className="flex gap-4 p-4 border-b" id={id}>
            <Avatar>
                <AvatarImage src={data?.image} />
                <AvatarFallback>{data?.displayUsername[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
                <Textarea
                    placeholder={placeholder}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="resize-none border-none focus-visible:ring-0 text-lg"
                />

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
                            <Loader2 className="animate-spin w-4 h-4" />
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