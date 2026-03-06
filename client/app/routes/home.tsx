import type { Route } from "./+types/home";
import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import type { APIResponse } from "~/lib/types";
import { HomeIcon, Loader2 } from "lucide-react";
import PostCard from "~/components/PostCard";
import { Separator } from "~/components/ui/separator";
import { NavLink } from "react-router";
import PostComposer from "~/components/PostComposer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter
} from "~/components/ui/dialog"
import { Button } from "~/components/ui/button";
import ProtectedRoute from "~/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { queryClient } from "~/lib/react-query";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "PU Connect" },
    { name: "description", content: "Your personalized feed" },
  ];
}

export default function Home() {
  const [tab, setTab] = useState('for-you')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedTab = sessionStorage.getItem("default-tab")
    if (savedTab) {
      setTab(savedTab)
    }
    setMounted(true)
  }, [])

  const {
    data,
    isPending,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["feed", tab],
    queryFn: async () => {
      const res = await api.get<APIResponse>(`/api/feed/${tab}`);
      return res.data.data;
    },
    enabled: mounted,
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
    <ProtectedRoute>
      <div className="min-h-screen bg-background">

        <main className="w-full min-h-screen flex flex-col">

          {/* Header Tabs */}
          <div className="sticky top-0 w-full bg-background/80 backdrop-blur-md border-b p-4 z-10">
            <Tabs value={tab} onValueChange={(value) => {
              sessionStorage.setItem("default-tab", value)
              setTab(value)
            }}>
              <TabsList className="w-full" variant="line">
                <TabsTrigger value="for-you">For You</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="w-full">
            <PostComposer />
            <Separator />
          </div>

          {/* Feed */}
          <div className="w-full flex flex-col">

            {/* Refetch Loader */}
            {isFetching && !isPending && (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin w-5 h-5 text-primary" />
              </div>
            )}

            {/* Empty State */}
            {data && data.length === 0 && !isPending ? (
              <div className="flex flex-1 items-center justify-center w-full text-center py-20">
                <div>
                  <p className="text-muted-foreground text-lg font-medium">
                    No posts yet
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Follow people or create a post to see content here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full">
                {data?.map((post: any) => (
                  <div key={post.id} className="w-full">
                    <PostCard post={post} />
                    <Separator />
                  </div>
                ))}
              </div>
            )}
          </div>

        </main>
      </div>
    </ProtectedRoute>
  );
}