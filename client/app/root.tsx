import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { ThemeProvider } from "./components/theme-provider";
import Header from "./components/Header";
import { Toaster } from "./components/ui/sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/react-query";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import { useMe } from "./hooks/useMe";
import { useStorageSync } from "./hooks/useStorageSync";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];



export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-muted/40">
        <main>
          {children}
        </main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  useStorageSync();

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <ThemeProvider>
          <Outlet />
          <Toaster />
        </ThemeProvider>
      </SidebarProvider>
    </QueryClientProvider>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 404:
        message = "404";
        details = "The page you're looking for doesn't exist.";
        break;
      case 403:
        message = "403";
        details = "You don't have permission to view this page.";
        break;
      case 401:
        message = "401";
        details = "Please sign in to continue.";
        break;
      case 429:
        message = "Too Many Requests";
        details = "You're doing that too often. Please wait a moment and try again.";
        break;
      case 500:
        message = "Server Error";
        details = "Something went wrong on our end. Please try again later.";
        break;
      default:
        message = `Error ${error.status}`;
        details = error.statusText || details;
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-muted-foreground">{message}</h1>
        <p className="text-lg text-muted-foreground">{details}</p>
        <a href="/" className="inline-block mt-4 text-primary underline">
          Go back home
        </a>
      </div>
    </main>
  );
}
