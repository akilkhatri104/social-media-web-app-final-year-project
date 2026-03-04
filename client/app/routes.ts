import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("/signup", "./routes/signup.tsx"),
    route("/signin", "./routes/signin.tsx"),
    route("/verify-email", "./routes/verify-email.tsx"),
    route("/post/:id", "./routes/post.$id.tsx"),
] satisfies RouteConfig;
