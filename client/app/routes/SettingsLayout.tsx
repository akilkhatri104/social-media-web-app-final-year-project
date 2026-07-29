import { NavLink, Outlet } from "react-router";
import { UserIcon, ShieldIcon, BellIcon, Trash2Icon } from "lucide-react";
import { cn } from "~/lib/utils";

const settingsNav = [
  { to: "/settings/profile", label: "Profile", icon: UserIcon },
  { to: "/settings/security", label: "Security", icon: ShieldIcon },
  { to: "/settings/notifications", label: "Notifications", icon: BellIcon },
  { to: "/settings/account", label: "Account", icon: Trash2Icon },
];

export default function SettingsLayout() {
  return (
    <div className="flex min-h-screen w-full">
      {/* Settings sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-border md:flex md:flex-col">
        <div className="sticky top-0 p-4">
          <h2 className="mb-4 px-2 text-lg font-semibold">Settings</h2>
          <nav className="flex flex-col gap-1">
            {settingsNav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary/50 font-semibold text-foreground"
                      : "text-muted-foreground hover:bg-accent-foreground/10 hover:text-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="flex w-full flex-col">
        <nav className="flex gap-1 overflow-x-auto border-b border-border px-4 py-2 md:hidden">
          {settingsNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors",
                  isActive
                    ? "bg-primary/50 font-semibold text-foreground"
                    : "text-muted-foreground hover:bg-accent-foreground/10 hover:text-foreground"
                )
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
