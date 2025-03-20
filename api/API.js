import axios from "axios";
import { DATABASE_API } from "@env";
export const myIP = "192.168.1.12";
const API = DATABASE_API || `http://${myIP}:3000/api`;

const http = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const api = {
  login: async (params) => {
    return await http.post("/auth/login", params);
  },
};
