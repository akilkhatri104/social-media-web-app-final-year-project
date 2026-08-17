import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import { UserAvatar } from "~/components/UserAvatar";
import { LoadingState } from "~/components/ui/spinner";
import { QueryEmptyState, QueryErrorState } from "~/components/QueryState";

export default function UserProfile() {

  const { username } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      const res = await api.get(`/api/users/${username}`);
      return res.data.data;
    },
    enabled: !!username
  });

  if (isLoading) {
    return <LoadingState label="Loading profile..." variant="page" />;
  }

  if (isError) {
    return <QueryErrorState message="Failed to load profile. Please try again." />;
  }

  const user = data;

  if (!user) {
    return <QueryEmptyState label={`User "${username}" not found.`} />;
  }

  return (
    <div className="p-10 text-white">

      <div className="flex items-center gap-10">

        <UserAvatar
          image={user?.image}
          name={user?.name}
          username={user?.username}
          displayUsername={user?.displayUsername}
          className="w-32 h-32 border"
        />

        <div>

          <h2 className="text-2xl font-bold">
            {user?.name}
            <span className="text-gray-400 ml-2">
              @{user?.displayUsername}
            </span>
          </h2>

          <p className="mt-2 text-gray-400">
            {user?.bio || "No bio"}
          </p>

        </div>

      </div>

    </div>
  );
}
