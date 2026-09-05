import type * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

type UserAvatarProps = Omit<React.ComponentProps<typeof Avatar>, "children"> & {
  image?: string | null;
  name?: string | null;
  username?: string | null;
  displayUsername?: string | null;
};

function getInitials(value?: string | null) {
  const name = value?.trim();

  if (!name) return "U";

  const words = name.split(/\s+/).filter(Boolean);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function UserAvatar({
  image,
  name,
  username,
  displayUsername,
  ...props
}: UserAvatarProps) {
  const fallbackName = name || displayUsername || username;
  const imageSrc = image?.trim() || undefined;

  return (
    <Avatar {...props}>
      <AvatarImage src={imageSrc} alt={fallbackName || "User"} />
      <AvatarFallback>{getInitials(fallbackName)}</AvatarFallback>
    </Avatar>
  );
}

export { getInitials as getUserInitials };
