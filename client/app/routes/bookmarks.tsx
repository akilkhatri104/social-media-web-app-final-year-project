import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import type { APIResponse, PostDto } from "~/lib/types";
import { BookmarkIcon } from "lucide-react";
import PostCard from "~/components/PostCard";
import { Separator } from "~/components/ui/separator";
import { queryKeys } from "~/lib/react-query";
import { Spinner } from "~/components/ui/spinner";

export default function Bookmarks() {
  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.bookmarks.all,
    queryFn: async () => {
      const res = await api.get<APIResponse>("/api/bookmarks");
      return res.data.data as PostDto[];
    },
  });

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-destructive">Failed to load bookmarks</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="w-full min-h-screen flex flex-col">
        {/* Header */}
        <div className="sticky top-0 w-full bg-background/80 backdrop-blur-md border-b p-4 z-10">
          <div className="flex items-center gap-2">
            <BookmarkIcon size={20} />
            <h1 className="text-lg font-bold">Bookmarks</h1>
          </div>
        </div>

        {/* Bookmarked Posts */}
        {data && data.length > 0 ? (
          data.map((post) => (
            <div key={post.id}>
              <PostCard post={post} />
              <Separator />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <BookmarkIcon size={48} className="mb-4" />
            <p className="text-lg font-semibold">No bookmarks yet</p>
            <p className="text-sm">Save posts to see them here</p>
          </div>
        )}
      </main>
    </div>
  );
}
