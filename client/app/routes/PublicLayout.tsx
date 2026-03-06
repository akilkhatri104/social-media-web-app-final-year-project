import { Outlet } from "react-router"
import VerifyEmailDialog from "~/components/VerifyEmailDialog"

export default function PublicLayout() {
    return (
        <div className="min-h-screen min-w-screen bg-muted/40">

            <Outlet />
        </div>
    )
}