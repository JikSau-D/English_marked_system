import axios from "axios";

export const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.toString().trim() || "/api";

export const http = axios.create({
  baseURL: apiBaseUrl,
  timeout: 120000,
});

export function setAuthToken(token: string | null) {
  if (token) {
    http.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete http.defaults.headers.common["Authorization"];
  }
}

