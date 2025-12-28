import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:80",
  timeout: 10000, // optional: request timeout in ms
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
