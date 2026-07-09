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
        <div className="mt-2 rounded-2xl border p-3 hover:bg-accent/40">
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

            {Array.isArray(post.hashtags) && post.hashtags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                    {post.hashtags.map((tag) => (
                        <Link
                            key={tag}
                            to={`/hashtag/${tag}`}
                            className="rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-primary hover:bg-accent/80"
                        >
                            #{tag}
                        </Link>
                    ))}
                </div>
            )}

            {post.media?.length > 0 && (
                <div className="mt-2 overflow-hidden rounded-xl border">
                    {post.media[0].type === "image" ? (
                        <img src={post.media[0].url} alt="quoted post media" className="w-full object-cover" />
                    ) : (
                        <video src={post.media[0].url} controls className="w-full object-cover" />
                    )}
                </div>
            )}

            <Link
                to={`/post/${post.id}`}
                className="mt-3 inline-flex text-xs font-medium text-primary hover:underline"
            >
                View quoted post
            </Link>
        </div>
    );
}
