import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import { Separator } from "~/components/ui/separator";
import { useDocumentTitle } from "~/lib/title";

type NotificationSetting = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
};

const initialSettings: NotificationSetting[] = [
  {
    id: "email_notifications",
    label: "Email notifications",
    description: "Receive notifications about activity via email.",
    enabled: true,
  },
  {
    id: "push_notifications",
    label: "Push notifications",
    description: "Receive push notifications in your browser or device.",
    enabled: false,
  },
  {
    id: "marketing_emails",
    label: "Marketing emails",
    description: "Receive news, product updates, and special offers.",
    enabled: false,
  },
  {
    id: "security_alerts",
    label: "Security alerts",
    description: "Get notified about new logins or suspicious activity.",
    enabled: true,
  },
  {
    id: "product_updates",
    label: "Product updates",
    description: "Stay informed about new features and improvements.",
    enabled: true,
  },
];

export default function NotificationsSettings() {
  useDocumentTitle("Notifications · Settings");

  const [settings, setSettings] = useState<NotificationSetting[]>(() => {
  // Pull from localStorage if available
  const fromLS = localStorage.getItem('notification_settings');
  if (fromLS) {
    try {
      return JSON.parse(fromLS);
    } catch {}
  }
  return initialSettings;
});

  const toggle = (id: string) => {
    setSettings(prev => {
      const updated = prev.map(s => (s.id === id ? { ...s, enabled: !s.enabled } : s));
      localStorage.setItem('notification_settings', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="max-w-2xl space-y-8 p-6 md:p-10">
      <h1 className="text-2xl font-bold">Notifications</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification Preferences</CardTitle>
          <CardDescription>
            Choose how and when you want to be notified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          {settings.map((setting, index) => (
            <div key={setting.id}>
              {index > 0 && <Separator className="my-0" />}
              <div className="flex items-center justify-between py-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{setting.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {setting.description}
                  </p>
                </div>
                <Switch
                  checked={setting.enabled}
                  onCheckedChange={() => toggle(setting.id)}
                  aria-label={setting.label}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
