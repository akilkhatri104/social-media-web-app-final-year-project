import type { Route } from "./+types/home";
import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import type { APIResponse } from "~/lib/types";
import { Loader2 } from "lucide-react";
import PostCard from "~/components/PostCard";
import { Separator } from "~/components/ui/separator";
import { Link, NavLink } from "react-router";
import PostComposer from "~/components/PostComposer";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "PU Connect" },
    { name: "description", content: "Your personalized feed" },
  ];
}

export default function Home() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const res = await api.get<APIResponse>("/api/feed/simple-for-you");
      return res.data.data;
    },
  });

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-destructive">Failed to load posts</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto flex">

        {/* LEFT SIDEBAR */}
        <aside className="hidden md:flex w-1/4 h-screen sticky top-0 border-r p-6 flex-col gap-6">
          <h1 className="text-2xl font-bold">PU Connect</h1>
          <nav className="flex flex-col gap-4 text-muted-foreground">
            <p className="hover:text-foreground cursor-pointer">Home</p>
            <p className="hover:text-foreground cursor-pointer">Explore</p>
            <p className="hover:text-foreground cursor-pointer">Profile</p>
          </nav>
        </aside>

        {/* CENTER FEED */}
        <main className="flex-1 border-r min-h-screen">
          <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b p-4 z-10">
            <h2 className="text-xl font-semibold">Home</h2>
          </div>

          <PostComposer />
          <Separator />

          <div className="flex flex-col">
            {data?.map((post: any) => (
              <NavLink to={`/post/${post.id}`}>
                <div key={post.id}>
                  <PostCard post={post} />
                  <Separator />
                </div>
              </NavLink>
            ))}
          </div>
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden lg:flex w-1/4 h-screen sticky top-0 p-6">
          <div className="bg-muted p-4 rounded-2xl w-full">
            <h3 className="font-semibold mb-2">Trends for you</h3>
            <p className="text-sm text-muted-foreground">#React</p>
            <p className="text-sm text-muted-foreground">#PUConnect</p>
            <p className="text-sm text-muted-foreground">#WebDevelopment</p>
          </div>
        </aside>

      </div>
    </div>
  );
}