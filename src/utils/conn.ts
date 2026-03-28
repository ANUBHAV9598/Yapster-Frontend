import axios from "axios";
import { io } from "socket.io-client";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
export const AUTH_TOKEN_KEY = "chat_app_token";

export const api = axios.create({
  baseURL: API_URL,
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

const storedToken = window.localStorage.getItem(AUTH_TOKEN_KEY);

if (storedToken) {
  setAuthToken(storedToken);
}

export const socket = io(API_URL, {
  autoConnect: true,
});
