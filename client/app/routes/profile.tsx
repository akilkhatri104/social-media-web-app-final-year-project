import { useState, useEffect } from "react";
import { queryClient, queryKeys } from "~/lib/react-query";
import { Button } from "~/components/ui/button";
import { UserAvatar } from "~/components/UserAvatar";
import { useMe } from "~/hooks/useMe";
import { useDocumentTitle } from "~/lib/title";
import { LoadingState } from "~/components/ui/spinner";

export default function Profile() {

  const [activeTab, setActiveTab] = useState("posts");
   const { data, isLoading } = useMe();
   const user = data;
   const profileTitle = user?.name ? `${user.name} (@${user.displayUsername})` : "Profile";

   useEffect(() => {
     // Always refetch the latest user on mount (fixes stale avatar)
     queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
   }, []);

   useEffect(() => {
     // DEV: Log the user image to debug avatar issues
     console.log("[Profile Page] user.image=", user?.image);
   }, [user]);

   useDocumentTitle(profileTitle);


  if (isLoading) {
    return <LoadingState label="Loading profile..." variant="page" />;
  }

  if (!user) {
    return (
      <div className="p-10 text-white">
        User not found
      </div>
    );
  }

  return (
    <div className="p-10 text-white">

      {/* Profile Header */}
      <div className="flex items-center gap-10">

        {/* Avatar */}
        <UserAvatar
          image={user?.image}
          name={user?.name}
          username={user?.username}
          displayUsername={user?.displayUsername}
          className="w-32 h-32 border-2 border-white"
        />

        {/* Info */}
        <div>

          <h2 className="text-2xl font-bold">

            {user?.name || user?.displayUsername}

            <span className="text-gray-400 ml-2">
              @{user?.displayUsername}
            </span>

          </h2>

          <Button>
            Edit Profile
          </Button>

          <div className="flex gap-8 mt-3">

            <span>
              {user?.followers?.length ?? 0} followers
            </span>

            <span>
              {user?.following?.length ?? 0} following
            </span>

          </div>

        </div>

      </div>


      {/* Tabs */}
      <div className="flex gap-10 mt-10 border-b pb-2">

        <button onClick={() => setActiveTab("posts")}>
          Posts
        </button>

        <button onClick={() => setActiveTab("comments")}>
          Comments
        </button>

        <button onClick={() => setActiveTab("likes")}>
          Likes
        </button>

      </div>


      {/* Content */}
      <div className="border mt-6 p-10">

        {activeTab === "posts" && <p>User Posts</p>}
        {activeTab === "comments" && <p>User Comments</p>}
        {activeTab === "likes" && <p>User Likes</p>}

      </div>

    </div>
  );
}
