import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import { queryKeys } from "~/lib/react-query";
import type { APIResponse } from "~/lib/types";
import { Button } from "~/components/ui/button";

export default function NotificationsList() {
  const qc = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
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
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });

  const markOne = useMutation({
    mutationFn: async (id: number) => {
      const res = await api.patch<APIResponse>(`/api/notifications/read/${id}`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  });

  if (isLoading) return <div>Loading...</div>;

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
        {notifications.map((n: any) => (
          <div key={n.id} className={`p-3 rounded-lg border ${n.readAt ? 'bg-card' : 'bg-primary/5'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm">
                  {n.type === 'follow' ? (
                    <>
                      <strong>{n.actor?.name || n.actorId}</strong> started following you
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
                <Button variant="ghost" size="sm" onClick={async () => { await api.delete(`/api/notifications/${n.id}`); qc.invalidateQueries({ queryKey: queryKeys.notifications.all }); }}>Delete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
