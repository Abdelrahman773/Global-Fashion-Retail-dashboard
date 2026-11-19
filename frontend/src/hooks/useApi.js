import { useCallback, useEffect, useState } from "react";

// Leave empty to use a dev proxy (e.g. Vite `server.proxy` -> Flask),
// or set VITE_API_URL=http://localhost:5000 in .env
const BASE_URL = import.meta.env?.VITE_API_URL ?? "";

/** Fetches one endpoint. status: "loading" | "success" | "empty" | "error" */
export function useApi(endpoint) {
  const [state, setState] = useState({ status: "loading", data: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading", data: null, error: null });

    fetch(`${BASE_URL}${endpoint}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Unexpected response format");
        setState({ status: data.length ? "success" : "empty", data, error: null });
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setState({ status: "error", data: null, error: err.message });
        }
      });

    return () => controller.abort();
  }, [endpoint, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, reload };
}
