import { Link } from "react-router";
import type { PostDto } from "~/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function QuotedPostEmbed({ post }: { post: PostDto | null }) {
    if (!post) {
        return (
            <div className="mt-2 rounded-2xl border p-3 text-sm text-muted-foreground">
                Quoted post unavailable
            </div>
        );
    }

    return (
        <Link
            to={`/post/${post.id}`}
            className="mt-2 block rounded-2xl border p-3 hover:bg-accent/40"
        >
            <div className="text-sm flex items-center">
                <Avatar>
                    <AvatarImage src={post.author.image} />
                    <AvatarFallback>{post.author.displayUsername[0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{post.author?.name}</span>
                <span className="ml-2 text-muted-foreground">
                    @{post.author?.displayUsername}
                </span>
            </div>

            <p className="mt-2 text-sm whitespace-pre-wrap">{post.content}</p>

            {post.media?.length > 0 && (
                <div className="mt-2 overflow-hidden rounded-xl border">
                    {post.media[0].type === "image" ? (
                        <img src={post.media[0].url} alt="quoted post media" className="w-full object-cover" />
                    ) : (
                        <video src={post.media[0].url} controls className="w-full object-cover" />
                    )}
                </div>
            )}
        </Link>
    );
}
