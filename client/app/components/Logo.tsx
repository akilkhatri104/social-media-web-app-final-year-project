import { NavLink } from "react-router";

export function Logo() {
    return (
        <NavLink to={'/'}>
            <div className="bg-accent text-accent-foreground text-center p-2 rounded-xl font-bold text-xl">
                PU Connect
            </div>
        </NavLink>
    )
}