import { useParams, Link } from "react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import { useState } from "react";
import PostCard from "~/components/PostCard";
import { Separator } from "~/components/ui/separator";
import { queryClient } from "~/lib/react-query";
import { useMe } from "~/hooks/useMe";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { toast } from "sonner";
import axios from "axios";

export default function UserProfile() {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState("posts");
  const [followDialog, setFollowDialog] = useState<"followers" | "following" | null>(null);
  const cleanUsername = username?.replace("@", "");
  const { data: session } = useMe();

  // Fetch user info
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["userProfile", cleanUsername],
    queryFn: async () => {
      const res = await api.get(`/api/users/${cleanUsername}`);
      return res.data.data?.user;
    },
    enabled: !!cleanUsername
  });

  // Fetch follower count
  const { data: followerCount } = useQuery({
    queryKey: ["followerCount", userData?.id],
    queryFn: async () => {
      const res = await api.get(`/api/follows/followers/count/${userData?.id}`);
      return res.data.data?.count ?? 0;
    },
    enabled: !!userData?.id
  });

  // Fetch following count
  const { data: followingCount } = useQuery({
    queryKey: ["followingCount", userData?.id],
    queryFn: async () => {
      const res = await api.get(`/api/follows/following/count/${userData?.id}`);
      return res.data.data?.count ?? 0;
    },
    enabled: !!userData?.id
  });

  // Fetch followers list (only when dialog opens)
  const { data: followersList, isLoading: followersLoading } = useQuery({
    queryKey: ["followersList", userData?.id],
    queryFn: async () => {
      const res = await api.get(`/api/follows/followers/${userData?.id}`);
      return res.data.data?.followers; // ✅ correct field name
    },
    enabled: !!userData?.id && followDialog === "followers"
  });

  // Fetch following list (only when dialog opens)
  const { data: followingList, isLoading: followingLoading } = useQuery({
    queryKey: ["followingList", userData?.id],
    queryFn: async () => {
      const res = await api.get(`/api/follows/following/${userData?.id}`);
      return res.data.data?.following; // ✅ correct field name
    },
    enabled: !!userData?.id && followDialog === "following"
  });

  // Follow / Unfollow
  const followMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/api/follows/${userData?.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followerCount", userData?.id] });
      queryClient.invalidateQueries({ queryKey: ["followersList", userData?.id] });
      toast.success("Done!");
    },
    onError: (err) => {
      toast.error(axios.isAxiosError(err) ? err.response?.data.message : "Error");
    }
  });

  // Fetch user posts
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["userPosts", userData?.id],
    queryFn: async () => {
      const res = await api.get(`/api/posts/users/${userData?.id}`);
      return res.data.data;
    },
    enabled: !!userData?.id
  });

  if (userLoading) return <p className="p-10 text-white">Loading...</p>;
  if (!userData) return <p className="p-10 text-white">User not found</p>;

  // ✅ correct session structure check
  const isOwnProfile = session?.user?.id === userData?.id;

  return (
    <div className="text-white">

      {/* Profile Header */}
      <div className="flex items-center gap-10 p-10">
        <img
          src={userData.image || `https://ui-avatars.com/api/?name=${userData.displayUsername}`}
          className="w-32 h-32 rounded-full border-2 border-white"
        />
        <div>
          <h2 className="text-2xl font-bold">
            {userData.name}
            <span className="text-gray-400 ml-2">@{userData.displayUsername}</span>
          </h2>

          {/* ✅ Edit Profile for own profile, Follow for others */}
          {isOwnProfile ? (
            <Link to="/settings/profile">
              <button className="border px-4 py-1 mt-2 hover:bg-white hover:text-black">
                Edit Profile
              </button>
            </Link>
          ) : (
            <button
              onClick={() => followMutation.mutate()}
              disabled={followMutation.isPending}
              className="border px-4 py-1 mt-2 hover:bg-white hover:text-black disabled:opacity-50"
            >
              {followMutation.isPending ? "..." : "Follow"}
            </button>
          )}

          {/* Clickable follower/following counts */}
          <div className="flex gap-8 mt-3">
            <button onClick={() => setFollowDialog("followers")} className="hover:underline">
              <span className="font-bold">{followerCount ?? 0}</span> followers
            </button>
            <button onClick={() => setFollowDialog("following")} className="hover:underline">
              <span className="font-bold">{followingCount ?? 0}</span> following
            </button>
          </div>
        </div>
      </div>

      {/* Followers Dialog */}
      <Dialog open={followDialog === "followers"} onOpenChange={(o) => !o && setFollowDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Followers</DialogTitle>
          </DialogHeader>
          {followersLoading && <p>Loading...</p>}
          {!followersLoading && followersList?.length === 0 && (
            <p className="text-muted-foreground">No followers yet</p>
          )}
          {followersList?.map((f: any) => (
            <Link
              key={f.id}
              to={`/@${f.displayUsername}`}
              onClick={() => setFollowDialog(null)}
              className="flex items-center gap-3 py-2 hover:bg-muted px-2 rounded"
            >
              <Avatar>
                <AvatarImage src={f.image} />
                <AvatarFallback>{f.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{f.name}</p>
                <p className="text-sm text-muted-foreground">@{f.displayUsername}</p>
              </div>
            </Link>
          ))}
        </DialogContent>
      </Dialog>

      {/* Following Dialog */}
      <Dialog open={followDialog === "following"} onOpenChange={(o) => !o && setFollowDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Following</DialogTitle>
          </DialogHeader>
          {followingLoading && <p>Loading...</p>}
          {!followingLoading && followingList?.length === 0 && (
            <p className="text-muted-foreground">Not following anyone yet</p>
          )}
          {followingList?.map((f: any) => (
            <Link
              key={f.id}
              to={`/@${f.displayUsername}`}
              onClick={() => setFollowDialog(null)}
              className="flex items-center gap-3 py-2 hover:bg-muted px-2 rounded"
            >
              <Avatar>
                <AvatarImage src={f.image} />
                <AvatarFallback>{f.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{f.name}</p>
                <p className="text-sm text-muted-foreground">@{f.displayUsername}</p>
              </div>
            </Link>
          ))}
        </DialogContent>
      </Dialog>

      {/* Tabs */}
      <div className="flex gap-10 px-10 border-b pb-2">
        {["posts", "comments", "likes"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab
              ? "font-bold border-b-2 border-white pb-1 capitalize"
              : "text-gray-400 capitalize"}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Posts Tab */}
      {activeTab === "posts" && (
        <div className="flex flex-col">
          {postsLoading && <p className="p-10">Loading posts...</p>}
          {!postsLoading && postsData?.length === 0 && (
            <p className="p-10 text-gray-400">No posts yet</p>
          )}
          {postsData?.map((post: any) => (
            <div key={post.id}>
              <PostCard post={post} />
              <Separator />
            </div>
          ))}
        </div>
      )}

      {activeTab === "comments" && (
        <p className="p-10 text-gray-400">Comments coming soon</p>
      )}
      {activeTab === "likes" && (
        <p className="p-10 text-gray-400">Likes coming soon</p>
      )}

    </div>
  );
}