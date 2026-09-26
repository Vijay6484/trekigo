const hostname =
    typeof window !== "undefined" ? window.location.hostname : "localhost";

export const BASE_URL =
    import.meta.env.VITE_API_URL ||
    (hostname === "localhost" || hostname === "127.0.0.1"
        ? "http://localhost:5001"
        : "http://localhost:5001");
