import { Navigate, Outlet, useLocation } from "react-router"
import { AppSidebar } from "~/components/AppSidebar"
import { ExploreSidebar } from "~/components/ExploreSidebar"
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar"
import { useMe } from "~/hooks/useMe"
import VerifyEmailPrompt from "~/components/VerifyEmailPrompt"
import { Spinner } from "~/components/ui/spinner"

export default function AppLayout() {
    const { isAuth, isInitialLoading, data: user } = useMe()
    const location = useLocation()

    if (isInitialLoading) return (
        <div className="min-h-screen min-w-screen flex items-center justify-center">
            <Spinner />
        </div>
    )

    if (!isAuth) {
        return <Navigate to="/signin" replace state={{ from: location }} />
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full min-w-screen bg-background">
                <AppSidebar />
                <main className="flex min-w-0 flex-1 flex-col">
                    <div className="sticky top-0 z-20 flex items-center border-b bg-background/95 px-4 py-3 backdrop-blur md:hidden">
                        <SidebarTrigger />
                    </div>
                    <div className="flex min-w-0 flex-1">
                        <div className="min-w-0 flex-1">
                            <VerifyEmailPrompt />
                            <Outlet />
                        </div>
                        <ExploreSidebar />
                    </div>
                </main>

            </div>
        </SidebarProvider>
    )
}
