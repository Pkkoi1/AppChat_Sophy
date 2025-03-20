import axios from "axios";
import { DATABASE_API } from "@env";
export const myIP = "192.168.1.12";
const API = DATABASE_API || `http://${myIP}:3000/api`;

const api = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const login = async (phone, password) => {
  try {
    const response = await api.post("/auth/login", {
      phone,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};
