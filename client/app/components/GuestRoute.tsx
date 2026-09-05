import { Navigate, useLocation } from "react-router"
import { useMe } from "~/hooks/useMe"
import { LoadingState } from "./ui/spinner"

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuth, isInitialLoading } = useMe()
    const location = useLocation()

    if (isInitialLoading) return <LoadingState label="Loading account..." variant="section" />

    if (isAuth) {
        return <Navigate to="/home" replace state={{ from: location }} />
    }

    return children
}

export default GuestRoute
