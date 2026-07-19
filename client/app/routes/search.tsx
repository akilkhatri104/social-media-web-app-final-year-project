import { useQuery } from "@tanstack/react-query";
import type { Route } from "./+types/search";
import { useSearchParams, Link } from "react-router";
import { api } from "~/lib/axios";
import type { APIResponse, SearchResponse } from "~/lib/types";
import { queryKeys } from "~/lib/react-query";
import { useDocumentTitle } from "~/lib/title";
import { Spinner } from "~/components/ui/spinner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import PostCard from "~/components/PostCard";
import { SearchBar } from "~/components/SearchBar";
import { Hash, Users, FileText } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Search | PU Connect" },
    { name: "description", content: "Search posts, users, and hashtags" },
  ];
}

function UserAvatar({ name, image }: { name: string; image: string | null }) {
  return (
    <Avatar className="h-12 w-12">
      <AvatarImage src={image ?? undefined} />
      <AvatarFallback>{name.charAt(0)}</AvatarFallback>
    </Avatar>
  );
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";

  useDocumentTitle(query ? `Search: ${query}` : "Search");

  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.explore.search(query),
    queryFn: async () => {
      const res = await api.get<APIResponse>("/api/explore/search", {
        params: { q: query, limit: 6 },
      });
      return res.data.data as SearchResponse;
    },
    enabled: !!query,
  });

  if (!query) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6">
          <Card>
            <CardHeader>
              <CardTitle>Search everything</CardTitle>
              <CardDescription>
                Find posts, people, and hashtags from one place.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SearchBar className="max-w-2xl" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

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
        <p className="text-destructive">Failed to load search results</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Search results</CardTitle>
            <CardDescription>
              Results for <span className="font-medium text-foreground">"{data.query}"</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SearchBar initialValue={query} className="max-w-2xl" />
          </CardContent>
        </Card>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                People
              </CardTitle>
              <CardDescription>{data.users.length} user{data.users.length === 1 ? "" : "s"} found</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.users.length > 0 ? (
                data.users.map((user) => {
                  const handle = user.displayUsername ?? user.username ?? user.name;

                  const content = (
                    <>
                      <UserAvatar name={user.name} image={user.image} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-none">{user.name}</p>
                        {handle && (
                          <p className="text-sm text-muted-foreground">@{handle}</p>
                        )}
                        {user.bio && (
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </>
                  );

                  if (!handle) {
                    return (
                      <div
                        key={user.id}
                        className="flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2"
                      >
                        {content}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={user.id}
                      to={`/@${encodeURIComponent(handle)}`}
                      className="flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2 transition-colors hover:border-primary/20 hover:bg-accent"
                    >
                      {content}
                    </Link>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground">No people matched your search.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Hashtags
              </CardTitle>
              <CardDescription>{data.hashtags.length} tag{data.hashtags.length === 1 ? "" : "s"} found</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {data.hashtags.length > 0 ? (
                data.hashtags.map((tag) => (
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
                <p className="text-sm text-muted-foreground">No hashtags matched your search.</p>
              )}
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Posts
            </CardTitle>
            <CardDescription>{data.posts.length} post{data.posts.length === 1 ? "" : "s"} found</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {data.posts.length > 0 ? (
              <div>
                {data.posts.map((post, index) => (
                  <div key={post.id}>
                    <PostCard post={post} />
                    {index !== data.posts.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 pb-6 text-sm text-muted-foreground">
                No posts matched your search.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
