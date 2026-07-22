import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import { useEffect, useState } from "react";
import PostCard from "~/components/PostCard";
import { Separator } from "~/components/ui/separator";
import { useMe } from "~/hooks/useMe";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import FollowButton from "~/components/FollowButton";
import { Button } from "~/components/ui/button";
import { queryKeys } from "~/lib/react-query";
import { Spinner } from "~/components/ui/spinner";
import { useDocumentTitle } from "~/lib/title";

export default function UserProfile() {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState("posts");
  const [followDialog, setFollowDialog] = useState<"followers" | "following" | null>(null);
  const cleanUsername = username?.replace("@", "");
  const { data: session } = useMe();

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: queryKeys.users.byUsername(cleanUsername),
    queryFn: async () => {
      const res = await api.get(`/api/users/${cleanUsername}`);
      console.log("USER DATA:", res.data);
      return res.data.data?.user;
    },
    enabled: !!cleanUsername
  });

  const profileTitle = userLoading
    ? "Profile"
    : userData
      ? `${userData.name} (@${userData.displayUsername})`
      : "User Not Found";

  useDocumentTitle(profileTitle);

  const { data: followersList, isLoading: followersLoading } = useQuery({
    queryKey: queryKeys.follow.followers(userData?.id),
    queryFn: async () => {
      const res = await api.get(`/api/follow/followers/${userData?.id}`);
      console.log("FOLLOWERS LIST:", res.data);
      return res.data.data;
    },
  });

  const { data: followingList, isLoading: followingLoading } = useQuery({
    queryKey: queryKeys.follow.following(userData?.id),
    queryFn: async () => {
      const res = await api.get(`/api/follow/following/${userData?.id}`);
      console.log("FOLLOWING LIST:", res.data);
      return res.data.data;
    },
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: queryKeys.posts.byUserId(userData?.id),
    queryFn: async () => {
      const res = await api.get(`/api/posts/users/${userData?.id}`);
      return res.data.data;
    },
    enabled: !!userData?.id
  });

  if (userLoading) return <p className="p-10 text-white">Loading...</p>;
  if (!userData) return <p className="p-10 text-white">User not found</p>;

  const isOwnProfile = session?.id === userData?.id;

  return (
    <div className="text-white">
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

          {isOwnProfile ? (
            <Link to="/settings/profile">
              <Button variant="outline" className="mt-2">
                Edit Profile
              </Button>
            </Link>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              <FollowButton userId={userData?.id} />
              <Link to={`/messages?to=${encodeURIComponent(userData.displayUsername || userData.username || "")}`}>
                <Button variant="outline">
                  Message
                </Button>
              </Link>
            </div>
          )}

          <div className="flex gap-8 mt-3">
            <button onClick={() => setFollowDialog("followers")} className="hover:underline">
              <span className="font-bold">{followersList?.count ?? 0}</span> followers
            </button>
            <button onClick={() => setFollowDialog("following")} className="hover:underline">
              <span className="font-bold">{followingList?.count ?? 0}</span> following
            </button>
          </div>
          {userData?.bio && (
            <div className="text-muted-foreground mt-3">
              {userData.bio}
            </div>
          )}
        </div>
      </div>

      {followersLoading ? <Spinner /> : (
        <Dialog open={followDialog === "followers"} onOpenChange={(o) => !o && setFollowDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Followers</DialogTitle>
            </DialogHeader>
            {followersLoading && <p>Loading...</p>}
            {!followersLoading && followersList && followersList?.followers?.length === 0 && (
              <p className="text-muted-foreground">No followers yet</p>
            )}
            {followersList && followersList.followers?.map((f: any) => (
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
      )}

      {followingLoading ? <Spinner /> : (
        <Dialog open={followDialog === "following"} onOpenChange={(o) => !o && setFollowDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Following</DialogTitle>
            </DialogHeader>
            {followingLoading && <p>Loading...</p>}
            {!followingLoading && followingList && followingList?.following?.length === 0 && (
              <p className="text-muted-foreground">Not following anyone yet</p>
            )}
            {followingList && followingList.following?.map((f: any) => (
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
      )}



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

      {activeTab === "comments" && <p className="p-10 text-gray-400">Comments coming soon</p>}
      {activeTab === "likes" && <p className="p-10 text-gray-400">Likes coming soon</p>}
    </div>
  );
}
