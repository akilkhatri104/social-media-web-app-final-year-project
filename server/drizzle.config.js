import "dotenv/config";

export default {
    schema: ["./src/lib/db/schema.js", "./src/lib/auth-schema.js"],
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
};
