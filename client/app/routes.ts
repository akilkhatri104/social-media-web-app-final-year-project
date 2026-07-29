import {
    type RouteConfig,
    index,
    layout,
    route,
} from "@react-router/dev/routes";

export default [
    layout("./routes/PublicLayout.tsx", [
        index("./routes/index.tsx"),
        route("/signin", "./routes/signin.tsx"),
        route("/signup", "./routes/signup.tsx"),
        route("/forgot-password", "./routes/forgot-password.tsx"),
    ]),

    layout("./routes/AppLayout.tsx", [
        route("/home", "./routes/home.tsx"),
        route("/explore", "./routes/explore.tsx"),
        route("/search", "./routes/search.tsx"),
        route("/hashtag/:tag", "./routes/hashtag.$tag.tsx"),
        route("/verify-email", "./routes/verify-email.tsx"),
        route("/post/:id", "./routes/post.$id.tsx"),
        route("/bookmarks", "./routes/bookmarks.tsx"),
        route("/profile", "./routes/profile.tsx"),
        route("/:username", "./routes/userProfile.tsx"),
        route("/messages", "./routes/messages.tsx"),
        layout("./routes/SettingsLayout.tsx", [
            route("/settings", "./routes/settings.tsx"),
            route("/settings/profile", "./routes/editProfile.tsx"),
            route("/settings/security", "./routes/settings.security.tsx"),
            route("/settings/notifications", "./routes/settings.notifications.tsx"),
            route("/settings/account", "./routes/settings.account.tsx"),
        ]),
    ]),
] satisfies RouteConfig;
