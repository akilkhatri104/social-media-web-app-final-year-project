import axios from "axios";

const baseURL: string | undefined = import.meta.env.VITE_BACKEND_URL;

if (baseURL && !URL.canParse(baseURL)) {
    throw new Error("Invalid backend URL provided");
}

export const api = axios.create({
    baseURL,
    withCredentials: true,
});
