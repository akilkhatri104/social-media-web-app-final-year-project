import { useQuery } from "@tanstack/react-query";
import type { Route } from "./+types/explore";
import { api } from "~/lib/axios";
import type { APIResponse, ExploreResponse } from "~/lib/types";
import { queryKeys } from "~/lib/react-query";
import { useDocumentTitle } from "~/lib/title";
import { Spinner } from "~/components/ui/spinner";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Link } from "react-router";
import PostCard from "~/components/PostCard";
import { Separator } from "~/components/ui/separator";
import { SearchBar } from "~/components/SearchBar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Explore | PU Connect" },
    { name: "description", content: "Discover trending hashtags and posts" },
  ];
}

export default function ExplorePage() {
  useDocumentTitle("Explore");

  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.explore.summary,
    queryFn: async () => {
      const res = await api.get<APIResponse>("/api/explore");
      return res.data.data as ExploreResponse;
    },
  });

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-destructive">Failed to load explore feed</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6">
        <SearchBar />
        <section className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>Trending hashtags</CardTitle>
              <CardDescription>
                Tags people are using most right now.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {data.trendingHashtags.length > 0 ? (
                data.trendingHashtags.map((tag) => (
                  <Link key={tag.name} to={`/hashtag/${tag.name}`}>
                    <Badge variant="outline" className="px-3 py-1.5 text-sm">
                      #{tag.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        {tag.postCount}
                      </span>
                    </Badge>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No trending hashtags yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Discover</CardTitle>
              <CardDescription>
                Browse what is getting attention across the app.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Trending tags are ranked by post volume and freshness.</p>
              <p>Popular posts are ranked by recent engagement.</p>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Popular posts</CardTitle>
            <CardDescription>
              Posts with strong engagement and recent activity.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {data.popularPosts.length > 0 ? (
              <div>
                {data.popularPosts.map((post, index) => (
                  <div key={post.id}>
                    <PostCard post={post} />
                    {index !== data.popularPosts.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 pb-6 text-sm text-muted-foreground">
                No popular posts yet.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
