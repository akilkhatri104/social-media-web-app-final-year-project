import "dotenv/config";

export default {
    schema: ["./src/lib/db/schema.ts", "./src/lib/auth-schema.ts"],
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
};
