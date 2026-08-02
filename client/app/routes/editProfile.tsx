import { useState, useEffect, useRef } from "react";
import { useMe } from "~/hooks/useMe";
import { api } from "~/lib/axios";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "sonner";
import { queryClient, queryKeys } from "~/lib/react-query";
import { useNavigate } from "react-router";
import axios from "axios";
import { useDocumentTitle } from "~/lib/title";
import { UserAvatar } from "~/components/UserAvatar";

export default function EditProfile() {
  useDocumentTitle("Edit Profile");

  const { data: user, isLoading } = useMe();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setUsername(user.username || "");
      setBio(user.bio || "");
      setImagePreview(user.image || null);
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      toast.loading("Saving changes...", { id: "edit-profile" });

      const formData = new FormData();
      if (name) formData.append("name", name);
      if (username) formData.append("username", username);
      if (bio !== undefined) formData.append("bio", bio);
      if (imageFile) formData.append("image", imageFile);

      const res = await api.put("/api/users", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Profile updated successfully!");
      queryClient.setQueryData(queryKeys.auth.me, res.data?.data?.user)
      queryClient.setQueryData(queryKeys.users.byUsername(username), res.data?.data?.user)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.byUsername(user?.username) })
      navigate(`/@${username}`);
    } catch (error) {
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data.message
          : "Failed to update profile"
      );
    } finally {
      setIsSaving(false);
      toast.dismiss("edit-profile");
    }
  };

  if (isLoading) return <p className="p-10 text-white">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto p-10 text-white space-y-6">
      <h1 className="text-2xl font-bold">Edit Profile</h1>

      {/* Profile Picture */}
      <div className="flex flex-col items-center gap-3">
        <UserAvatar
          image={imagePreview}
          name={name}
          username={username}
          className="w-24 h-24 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-sm text-blue-400 hover:underline"
        >
          Change profile picture
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleImageChange}
        />
      </div>

      {/* Name */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-400">Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
      </div>

      {/* Username */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-400">Username</label>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="username"
        />
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-400">Bio</label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          rows={3}
          maxLength={160}
          className="resize-none"
        />
        <span className="text-xs text-gray-500 text-right">{bio.length}/160</span>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <Button onClick={handleSubmit} disabled={isSaving} className="flex-1">
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
        <Button variant="outline" onClick={() => navigate(-1)} disabled={isSaving}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
