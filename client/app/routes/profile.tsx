import { useState } from "react";
import { Button } from "~/components/ui/button";
import { useMe } from "~/hooks/useMe";
import { useDocumentTitle } from "~/lib/title";

export default function Profile() {

  const [activeTab, setActiveTab] = useState("posts");
  const { data, isLoading } = useMe();
  const profileTitle = data?.name ? `${data.name} (@${data.displayUsername})` : "Profile";

  useDocumentTitle(profileTitle);

  const user = data?.data?.user;

  if (isLoading) {
    return (
      <div className="p-10 text-white">
        Loading profile...
      </div>
    );
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
        <img
          src={
            user?.image ||
            `https://ui-avatars.com/api/?name=${user?.displayUsername}`
          }
          className="w-32 h-32 rounded-full border-2 border-white"
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
