import { SearchIcon, SparklesIcon, TagIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { Badge } from "~/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Input } from "~/components/ui/input"

const exploreTags = [
  { label: "Campus Life", count: "128 posts" },
  { label: "Placements", count: "96 posts" },
  { label: "Hackathons", count: "74 posts" },
  { label: "Project Showcase", count: "58 posts" },
  { label: "Study Groups", count: "43 posts" },
  { label: "Design Inspiration", count: "37 posts" },
  { label: "Web Development", count: "31 posts" },
  { label: "Open Source", count: "24 posts" },
]

const suggestedSearches = [
  "Find trending conversations",
  "Discover student projects",
  "Browse communities by interest",
]

export function ExploreSidebar() {
  const [query, setQuery] = useState("")

  const filteredTags = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return exploreTags
    }

    return exploreTags.filter((tag) =>
      tag.label.toLowerCase().includes(normalizedQuery)
    )
  }, [query])

  return (
    <aside className="hidden w-80 shrink-0 border-r border-border/80 bg-background/95 xl:block">
      <div className="sticky top-0 flex h-svh flex-col">
        <div className="border-b border-border/80 px-5 py-6">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <SparklesIcon className="h-4 w-4" />
            Explore
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Search topics and jump into the conversations you care about.
          </p>
          <div className="relative mt-4">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search explore tags"
              className="pl-9"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tags"
              value={query}
            />
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
          <Card size="sm" className="gap-4">
            <CardHeader className="pb-0">
              <CardTitle>Tags</CardTitle>
              <CardDescription>
                {filteredTags.length} tag{filteredTags.length === 1 ? "" : "s"}{" "}
                available
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {filteredTags.length > 0 ? (
                filteredTags.map((tag, index) => (
                  <button
                    key={tag.label}
                    type="button"
                    className="group flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-accent"
                  >
                    <Badge variant={index === 0 ? "default" : "outline"}>
                      #{tag.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {tag.count}
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No tags match that search yet.
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
