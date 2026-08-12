import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "~/components/ui/dialog";
import { Logo } from "./Logo";
import {
  BookmarkIcon,
  HomeIcon,
  SparklesIcon,
  User2,
  MessageSquare,
  Bell,
  Settings2Icon,
} from "lucide-react";
import { NavLink, useLocation } from "react-router";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useMe } from "~/hooks/useMe";
import { Spinner } from "./ui/spinner";
import PostComposer from "./PostComposer";
import { Button } from "~/components/ui/button";
import LogoutButton from "./LogoutButton";
import { ModeToggle } from "./mode-toggle";
import { api } from "~/lib/axios";
import { queryKeys } from "~/lib/react-query";
import type { APIResponse } from "~/lib/types";

export function AppSidebar() {
  const location = useLocation();
  const { isInitialLoading, isAuth, data: user } = useMe();
  const { data: unreadCount = 0 } = useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: async () => {
      const res = await api.get<APIResponse>("/api/notifications/unread-count");
      return Number(res.data.data?.unreadCount || 0);
    },
    enabled: isAuth,
    refetchInterval: 5000,
  });

  const sidebarItems = [
    {
      icon: <HomeIcon />,
      name: "Home",
      to: "/home",
    },
    {
      icon: <MessageSquare />,
      name: "Messages",
      to: "/messages",
    },
    {
      icon: <Bell />,
      name: "Notifications",
      to: "/notifications",
      badge: unreadCount > 0 ? (unreadCount > 99 ? "99+" : String(unreadCount)) : null,
    },
    {
      icon: <BookmarkIcon />,
      name: "Bookmarks",
      to: "/bookmarks",
    },
    {
      icon: <SparklesIcon />,
      name: "Explore",
      to: "/explore",
    },
    {
      icon: <User2 />,
      name: "Profile",
      to: `/@${!isInitialLoading && isAuth ? user?.displayUsername : ""}`,
    },
    {
      icon: <Settings2Icon />,
      name: "Settings",
      to: "/settings",
    },
  ];
  if (isInitialLoading) return <Spinner />;

  if (!isAuth) return null;
  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {sidebarItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center p-2 rounded-xl transition-colors
       ${
         isActive
           ? "bg-primary/50 text-white font-bold"
           : "hover:bg-accent-foreground/50 text-muted-foreground"
       }`
              }
            >
              {({ isActive }) => (
                <div className="flex w-full items-center gap-2">
                  {/* Clone icon to control color */}
                  {React.cloneElement(item.icon, {
                    className: isActive
                      ? "text-white"
                      : "text-muted-foreground",
                  })}
                  <p>{item.name}</p>
                  {item.badge ? (
                    <span className={`ml-auto inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${isActive ? "bg-white/20 text-white" : "bg-primary text-primary-foreground"}`}>
                      {item.badge}
                    </span>
                  ) : null}
                </div>
              )}
            </NavLink>
          ))}
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">Post</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Post a reply</DialogTitle>
            </DialogHeader>
            <PostComposer />
          </DialogContent>
        </Dialog>
        <div className="flex w-full">
          <LogoutButton variant="outline" className="flex-1" />
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
