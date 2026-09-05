import { Navigate, Outlet, useLocation } from "react-router"
import Header from "~/components/Header"
import { LoadingState } from "~/components/ui/spinner"
import { useMe } from "~/hooks/useMe"

export default function PublicLayout() {
    const { isInitialLoading, isAuth } = useMe()
    const location = useLocation()

    if (isInitialLoading) {
        return <LoadingState label="Loading account..." variant="page" />
    }

    if (isAuth) {
        return <Navigate to="/home" replace state={{ from: location }} />
    }

    return (
        <div className="min-h-screen min-w-screen bg-muted/40">
            <Header />
            <Outlet />
        </div>
    )
}
