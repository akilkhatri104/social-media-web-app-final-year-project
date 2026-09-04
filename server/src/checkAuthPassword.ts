import "dotenv/config";
import { auth } from "./lib/auth.ts";

console.log(
  Object.keys(auth.api).filter((key) =>
    key.toLowerCase().includes("password"),
  ),
);

process.exit(0);