import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import { Separator } from "~/components/ui/separator";
import { LoadingState } from "~/components/ui/spinner";
import { api } from "~/lib/axios";
import { queryKeys } from "~/lib/react-query";
import { useDocumentTitle } from "~/lib/title";
import type { APIResponse, NotificationSettingsDto } from "~/lib/types";

type NotificationSetting = {
  id: keyof NotificationSettingsDto;
  label: string;
  description: string;
};

const notificationSettings: NotificationSetting[] = [
  {
    id: "inAppLikes",
    label: "Likes",
    description: "Show in-app notifications when someone likes your post.",
  },
  {
    id: "inAppComments",
    label: "Replies",
    description: "Show in-app notifications when someone replies to your post.",
  },
  {
    id: "inAppReposts",
    label: "Reposts",
    description: "Show in-app notifications when someone reposts your post.",
  },
  {
    id: "inAppFollows",
    label: "New followers",
    description: "Show in-app notifications when someone follows you.",
  },
  {
    id: "inAppQuotes",
    label: "Quotes",
    description: "Show in-app notifications when someone quotes your post.",
  },
  {
    id: "inAppMentions",
    label: "Mentions",
    description: "Show in-app notifications when someone mentions you.",
  },
];

const emailSettings: NotificationSetting[] = [
  {
    id: "emailEnabled",
    label: "Email notifications",
    description: "Enable email delivery for the activity types below.",
  },
  {
    id: "emailLikes",
    label: "Likes",
    description: "Send an email when someone likes your post.",
  },
  {
    id: "emailComments",
    label: "Replies",
    description: "Send an email when someone replies to your post.",
  },
  {
    id: "emailReposts",
    label: "Reposts",
    description: "Send an email when someone reposts your post.",
  },
  {
    id: "emailFollows",
    label: "New followers",
    description: "Send an email when someone follows you.",
  },
  {
    id: "emailQuotes",
    label: "Quotes",
    description: "Send an email when someone quotes your post.",
  },
  {
    id: "emailMentions",
    label: "Mentions",
    description: "Send an email when someone mentions you.",
  },
];

export default function NotificationsSettings() {
  useDocumentTitle("Notifications · Settings");

  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<NotificationSettingsDto>({
    queryKey: queryKeys.settings.notifications,
    queryFn: async () => {
      const res = await api.get<APIResponse>("/api/settings/notifications");
      return res.data.data?.settings as NotificationSettingsDto;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (payload: Partial<NotificationSettingsDto>) => {
      const res = await api.patch<APIResponse>("/api/settings/notifications", payload);
      return res.data.data?.settings as NotificationSettingsDto;
    },
    onSuccess: (nextSettings) => {
      queryClient.setQueryData(queryKeys.settings.notifications, nextSettings);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message ?? "Failed to update notification settings.");
    },
  });

  const toggle = (id: keyof NotificationSettingsDto) => {
    if (!settings) return;

    const nextValue = !settings[id];
    const payload: Partial<NotificationSettingsDto> = { [id]: nextValue };

    if (id === "emailEnabled" && !nextValue) {
      payload.emailLikes = false;
      payload.emailComments = false;
      payload.emailReposts = false;
      payload.emailFollows = false;
      payload.emailQuotes = false;
      payload.emailMentions = false;
    }

    updateSettings.mutate(payload);
  };

  if (isLoading || !settings) {
    return <LoadingState label="Loading notification settings..." variant="section" />;
  }

  const renderSettingsGroup = (
    title: string,
    description: string,
    items: NotificationSetting[],
    disableChildren = false,
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-0">
        {items.map((setting, index) => {
          const disabled = disableChildren && setting.id !== "emailEnabled";

          return (
            <div key={setting.id}>
              {index > 0 && <Separator className="my-0" />}
              <div className="flex items-center justify-between gap-4 py-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{setting.label}</p>
                  <p className="text-xs text-muted-foreground">{setting.description}</p>
                </div>
                <Switch
                  checked={settings[setting.id]}
                  onCheckedChange={() => toggle(setting.id)}
                  aria-label={setting.label}
                  disabled={disabled || updateSettings.isPending}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-2xl space-y-8 p-6 md:p-10">
      <h1 className="text-2xl font-bold">Notifications</h1>

      {renderSettingsGroup(
        "In-app notifications",
        "Choose which activity should appear in your notifications feed.",
        notificationSettings,
      )}

      {renderSettingsGroup(
        "Email notifications",
        "Choose which activity should also be delivered to your email inbox.",
        emailSettings,
        !settings.emailEnabled,
      )}
    </div>
  );
}
