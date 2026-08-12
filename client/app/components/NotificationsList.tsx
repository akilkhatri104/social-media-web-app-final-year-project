import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import { queryKeys } from "~/lib/react-query";
import type { APIResponse, NotificationDto } from "~/lib/types";
import { Button } from "~/components/ui/button";
import { LoadingState } from "~/components/ui/spinner";

export default function NotificationsList() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<NotificationDto[]>({
    queryKey: queryKeys.notifications.all,
    queryFn: async () => {
      const res = await api.get<APIResponse>(`/api/notifications`);
      return res.data.data?.notifications || [];
    },
    refetchInterval: 5000,
  });

  const markAll = useMutation({
    mutationFn: async () => {
      const res = await api.patch<APIResponse>(`/api/notifications/read-all`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
    },
  });

  const markOne = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.patch<APIResponse>(`/api/notifications/read/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
    },
  });

  if (isLoading) return <LoadingState label="Loading notifications..." variant="section" />;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold">Notifications</h1>
        <div className="flex gap-2">
          <Button onClick={() => markAll.mutate()} disabled={markAll.isPending}>Mark all read</Button>
        </div>
      </div>
      <div className="space-y-2">
        {notifications.length === 0 && <div className="text-sm text-muted-foreground">No notifications</div>}
        {notifications.map((n) => (
          <div key={n.id} className={`p-3 rounded-lg border ${n.readAt ? 'bg-card' : 'bg-primary/5'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">
                  {n.type === 'follow' ? (
                    <>
                      <strong>{n.actor?.name || n.actorId}</strong> started following you
                    </>
                  ) : n.type === 'mention' ? (
                    <>
                      <strong>{n.actor?.name || n.actorId}</strong> mentioned you in a post
                    </>
                  ) : (
                    <>
                      <strong>{n.actor?.name || n.actorId}</strong> {n.type} your post
                    </>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {!n.readAt && (
                  <Button size="sm" onClick={() => markOne.mutate(n.id)} disabled={markOne.isPending}>Mark read</Button>
                )}
                <Button variant="ghost" size="sm" onClick={async () => { await api.delete(`/api/notifications/${n.id}`); queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }); queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount }); }}>Delete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
