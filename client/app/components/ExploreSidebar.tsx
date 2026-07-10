import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router"
import { SparklesIcon, TagIcon } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { api } from "~/lib/axios"
import type { APIResponse, TrendingHashtag } from "~/lib/types"
import { queryKeys } from "~/lib/react-query"

const suggestedSearches = [
  "Find trending conversations",
  "Discover student projects",
  "Browse communities by interest",
]

export function ExploreSidebar() {
  const { data, isPending } = useQuery({
    queryKey: queryKeys.hashtags.trending,
    queryFn: async () => {
      const res = await api.get<APIResponse>("/api/hashtags/trending")
      return res.data.data as TrendingHashtag[]
    },
  })

  return (
    <aside className="hidden w-80 shrink-0 border-r border-border/80 bg-background/95 xl:block">
      <div className="sticky top-0 flex h-svh flex-col">
        <div className="border-b border-border/80 px-5 py-6">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <SparklesIcon className="h-4 w-4" />
            Explore
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Search topics, people, and posts from the top bar.
          </p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
          <Card size="sm" className="gap-4">
            <CardHeader className="pb-0">
              <CardTitle>Trending hashtags</CardTitle>
              <CardDescription>
                {data?.length ?? 0} tag{(data?.length ?? 0) === 1 ? "" : "s"} available
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {isPending ? (
                <p className="text-sm text-muted-foreground">Loading tags...</p>
              ) : data && data.length > 0 ? (
                data.map((tag, index) => (
                  <Link
                    key={tag.name}
                    to={`/hashtag/${tag.name}`}
                    className="group flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-accent"
                  >
                    <Badge variant={index === 0 ? "default" : "outline"}>
                      #{tag.name}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {tag.postCount} posts
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No trending hashtags yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card size="sm" className="gap-4">
            <CardHeader className="pb-0">
              <CardTitle>Suggested Searches</CardTitle>
              <CardDescription>Quick starting points for discovery.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedSearches.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-transparent bg-muted/50 px-3 py-3 text-sm"
                >
                  <TagIcon className="h-4 w-4 text-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </aside>
  )
}
