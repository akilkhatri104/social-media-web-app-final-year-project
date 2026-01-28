import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URL;

if (!baseURL || typeof baseURL !== "string" || !URL.canParse(baseURL)) {
    throw new Error("backend URL not provided");
}

export const api = axios.create({
    baseURL,
    withCredentials: true,
});
