import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "~/lib/axios";
import { useMe } from "~/hooks/useMe";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { toast } from "sonner";
import { MonitorIcon, SmartphoneIcon, GlobeIcon, LogOutIcon } from "lucide-react";
import axios from "axios";
import { useDocumentTitle } from "~/lib/title";
import { queryKeys } from "~/lib/react-query";
import type { APIResponse } from "~/lib/types";

type SessionItem = {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
};

type SessionsResponse = {
  sessions: SessionItem[];
  currentSessionId: string;
};

function parseUserAgent(ua: string | null) {
  if (!ua) return { browser: "Unknown", os: "Unknown", device: "Desktop" };

  const browser = ua.includes("Chrome")
    ? "Chrome"
    : ua.includes("Firefox")
    ? "Firefox"
    : ua.includes("Safari")
    ? "Safari"
    : ua.includes("Edge")
    ? "Edge"
    : "Unknown Browser";

  const os = ua.includes("Windows")
    ? "Windows"
    : ua.includes("Mac")
    ? "macOS"
    : ua.includes("Linux")
    ? "Linux"
    : ua.includes("Android")
    ? "Android"
    : ua.includes("iPhone") || ua.includes("iPad")
    ? "iOS"
    : "Unknown OS";

  const device =
    ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone")
      ? "Mobile"
      : "Desktop";

  return { browser, os, device };
}

function DeviceIcon({ ua }: { ua: string | null }) {
  const { device } = parseUserAgent(ua);
  if (device === "Mobile") return <SmartphoneIcon className="h-5 w-5 text-muted-foreground" />;
  return <MonitorIcon className="h-5 w-5 text-muted-foreground" />;
}

export default function SecuritySettings() {
  useDocumentTitle("Security · Settings");

  const { data: me } = useMe();
  const qc = useQueryClient();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ── Change Password ──────────────────────────────────────────────
  const changePasswordMutation = useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
      const res = await api.post<APIResponse>("/api/settings/change-password", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error) => {
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message ?? "Failed to change password"
          : "Failed to change password"
      );
    },
  });

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  // ── Sessions ─────────────────────────────────────────────────────
  const { data: sessionsData, isLoading: sessionsLoading, isError: sessionsError } = useQuery({
    queryKey: queryKeys.settings.sessions,
    queryFn: async () => {
      const res = await api.get<APIResponse>("/api/settings/sessions");
      return res.data.data as SessionsResponse;
    },
  });

  const revokeSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/settings/sessions/${id}`);
    },
    onSuccess: () => {
      toast.success("Session revoked.");
      qc.invalidateQueries({ queryKey: queryKeys.settings.sessions });
    },
    onError: () => toast.error("Failed to revoke session."),
  });

  const revokeOthersMutation = useMutation({
    mutationFn: async () => {
      await api.delete("/api/settings/sessions");
    },
    onSuccess: () => {
      toast.success("All other sessions revoked.");
      qc.invalidateQueries({ queryKey: queryKeys.settings.sessions });
    },
    onError: () => toast.error("Failed to revoke sessions."),
  });

  const sessions = sessionsData?.sessions ?? [];
  const currentSessionId = sessionsData?.currentSessionId;
  const otherSessions = sessions.filter((s) => s.id !== currentSessionId);

  return (
    <div className="max-w-2xl space-y-8 p-6 md:p-10">
      <h1 className="text-2xl font-bold">Security</h1>

      {/* ── Change Password ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted-foreground">Current password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted-foreground">New password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted-foreground">Confirm new password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={changePasswordMutation.isPending}
            className="w-full sm:w-auto"
          >
            {changePasswordMutation.isPending ? "Saving…" : "Update Password"}
          </Button>
        </CardContent>
      </Card>

      {/* ── Active Sessions ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Active Sessions</CardTitle>
          {otherSessions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => revokeOthersMutation.mutate()}
              disabled={revokeOthersMutation.isPending}
            >
              <LogOutIcon className="mr-2 h-3.5 w-3.5" />
              {revokeOthersMutation.isPending ? "Revoking…" : "Log out all others"}
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {sessionsLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))
          ) : sessionsError ? (
            <p className="text-sm text-destructive">Failed to load sessions.</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active sessions found.</p>
          ) : (
            sessions.map((s) => {
              const isCurrent = s.id === currentSessionId;
              const { browser, os } = parseUserAgent(s.userAgent);
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border p-4"
                >
                  <div className="flex items-start gap-3">
                    <DeviceIcon ua={s.userAgent} />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {browser} on {os}
                        </span>
                        {isCurrent && (
                          <Badge variant="secondary" className="text-xs">
                            This device
                          </Badge>
                        )}
                      </div>
                      {s.ipAddress && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <GlobeIcon className="h-3 w-3" />
                          {s.ipAddress}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Last active:{" "}
                        {new Date(s.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!isCurrent && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => revokeSessionMutation.mutate(s.id)}
                      disabled={revokeSessionMutation.isPending}
                    >
                      <LogOutIcon className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
