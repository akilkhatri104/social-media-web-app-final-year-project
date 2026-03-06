import { Outlet, Navigate, useLocation } from "react-router"
import { AppSidebar } from "~/components/AppSidebar"
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar"
import { useMe } from "~/hooks/useMe"
import VerifyEmailDialog from "../components/VerifyEmailDialog"

export default function AppLayout() {
    const { isAuth, isInitialLoading } = useMe()
    const location = useLocation()

    if (isInitialLoading) return null

    if (!isAuth) {
        return <Navigate to="/signin" state={{ from: location }} replace />
    }

    return (
        <SidebarProvider>
            <div className="flex w-full min-w-screen min-h-screen">
                <AppSidebar />
                <main className="flex-1 min-w-0 w-full">
                    <SidebarTrigger />
                    <Outlet />
                </main>

            </div>
        </SidebarProvider>
    )
}