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
    ]),

    layout("./routes/AppLayout.tsx", [
        route("/home", "./routes/home.tsx"),
        route("/verify-email", "./routes/verify-email.tsx"),
        route("/post/:id", "./routes/post.$id.tsx"),
        route("/bookmarks", "./routes/bookmarks.tsx"),
        route("/profile", "./routes/profile.tsx"),
        route("/settings/profile", "./routes/editProfile.tsx"),
        route("/:username", "./routes/userProfile.tsx"),
    ]),
] satisfies RouteConfig;
