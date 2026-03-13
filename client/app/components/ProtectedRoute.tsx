import { Navigate, useLocation } from "react-router"
import { useMe } from "~/hooks/useMe"
import { Spinner } from "./ui/spinner"

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuth, isInitialLoading } = useMe()
    const location = useLocation()

    if (isInitialLoading) return <Spinner />

    if (!isAuth) {
        return <Navigate to="/signin" replace state={{ from: location }} />
    }

    return children
}

export default ProtectedRoute
