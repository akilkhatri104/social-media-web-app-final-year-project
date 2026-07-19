import { ArrowRight, MessageSquare, ShieldCheck, Users } from "lucide-react";
import { NavLink } from "react-router";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/index";
import { useDocumentTitle } from "~/lib/title";

const highlights = [
  {
    title: "Share updates fast",
    description:
      "Post ideas, moments, and campus news in a feed built for quick conversation.",
    icon: MessageSquare,
  },
  {
    title: "Follow your circle",
    description:
      "Keep up with classmates, creators, and communities that matter to you.",
    icon: Users,
  },
  {
    title: "Private by design",
    description:
      "Create your account, manage your profile, and stay in control of your presence.",
    icon: ShieldCheck,
  },
];

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "PU Connect" },
    {
      name: "description",
      content: "Connect with your campus community through posts, profiles, and conversations.",
    },
  ];
}

export default function Index() {
  useDocumentTitle();

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,theme(colors.primary/.18),transparent_58%)]" />
      <div className="absolute left-[-6rem] top-28 -z-10 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute right-[-4rem] top-40 -z-10 h-64 w-64 rounded-full bg-accent blur-3xl" />

      <section className="mx-auto flex min-h-[calc(100vh-73px)] w-full max-w-6xl items-center px-6 py-14 sm:px-8 lg:px-10">
        <div className="grid w-full gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center rounded-full border border-primary/20 bg-background/80 px-4 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur">
              Built for conversations that move quickly
            </div>

            <h1 className="text-4xl font-black tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Meet, post, and stay connected on PU Connect.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              A social space for your community to share updates, discover people,
              and keep every important conversation in one place.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="min-w-36">
                <NavLink to="/signup">
                  Create account
                  <ArrowRight />
                </NavLink>
              </Button>
              <Button asChild variant="outline" size="lg" className="min-w-36">
                <NavLink to="/signin">Sign in</NavLink>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border bg-background/80 p-4 shadow-sm backdrop-blur">
                <p className="text-2xl font-bold">Profiles</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Personal identity for every user.
                </p>
              </div>
              <div className="rounded-3xl border bg-background/80 p-4 shadow-sm backdrop-blur">
                <p className="text-2xl font-bold">Feeds</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Follow updates in real time.
                </p>
              </div>
              <div className="rounded-3xl border bg-background/80 p-4 shadow-sm backdrop-blur">
                <p className="text-2xl font-bold">Connections</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Grow your network around shared interests.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[2rem] border border-border/70 bg-background/90 p-6 shadow-xl shadow-primary/5 backdrop-blur">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Why join
                  </p>
                  <h2 className="text-2xl font-bold">Start your network here</h2>
                </div>
                <div className="rounded-2xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
                  New
                </div>
              </div>

              <div className="space-y-4">
                {highlights.map(({ title, description, icon: Icon }) => (
                  <div
                    key={title}
                    className="rounded-3xl border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl bg-primary/12 p-3 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold">{title}</h3>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
