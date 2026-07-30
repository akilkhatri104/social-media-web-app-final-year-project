import React from "react";
import NotificationsList from "~/components/NotificationsList";

export default function NotificationsRoute() {
  return (
    <div className="flex-1 overflow-y-auto">
      <NotificationsList />
    </div>
  );
}
