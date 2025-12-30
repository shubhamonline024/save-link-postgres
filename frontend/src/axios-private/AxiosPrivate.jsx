import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASEURL,
  timeout: 10000, // optional: request timeout in ms
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
