import { useEffect } from "react"
import { useNavigate } from "react-router"
import { useMe } from "~/hooks/useMe"
import { Spinner } from "./ui/spinner"

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuth, isInitialLoading } = useMe()
    const navigate = useNavigate()

    useEffect(() => {
        if (!isInitialLoading && !isAuth) {
            navigate('/')
        }
    }, [isAuth, isInitialLoading, navigate])

    if (isInitialLoading) return <Spinner />

    return !isAuth ? null : children
}

export default ProtectedRoute