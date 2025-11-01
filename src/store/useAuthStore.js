import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useCallStore } from "./useCallStore"; 

const BASE_URL =
 import.meta.env.MODE === "development"
  ? import.meta.env.VITE_SOCKET_URL
  : "/";

export const useAuthStore = create((set, get) => ({
 authUser: null,
 isSigningUp: false,
 isLoggingIn: false,
 isUpdatingProfile: false,
 isCheckingAuth: true,
 onlineUsers: [],
 socket: null,

 checkAuth: async () => {
  try {
   const res = await axiosInstance.get("/auth/check");
   set({ authUser: res.data });
   get().connectSocket();
  } catch (error) {
   console.log("Error in checkAuth:", error);
   set({ authUser: null });
  } finally {
   set({ isCheckingAuth: false });
  }
 },

 signup: async (data) => {
  set({ isSigningUp: true });
  try {
   const res = await axiosInstance.post("/auth/signup", data);
   set({ authUser: res.data });
   toast.success("Account created successfully");
   get().connectSocket();
  } catch (error) {
   toast.error(error.response?.data?.message || "Signup failed");
  } finally {
   set({ isSigningUp: false });
  }
 },

 login: async (data) => {
  set({ isLoggingIn: true });
  try {
   const res = await axiosInstance.post("/auth/login", data);
   set({ authUser: res.data });
   toast.success("Logged in successfully");
   get().connectSocket();
  } catch (error) {
   toast.error(error.response?.data?.message || "Login failed");
  } finally {
   set({ isLoggingIn: false });
  }
 },

 logout: async () => {
  try {
   await axiosInstance.post("/auth/logout");
   set({ authUser: null });
   toast.success("Logged out successfully");
   get().disconnectSocket();
  } catch (error) {
   toast.error(error.response?.data?.message || "Logout failed");
  }
 },

 updateProfile: async (data) => {
  set({ isUpdatingProfile: true });
  try {
   const res = await axiosInstance.put("/auth/update-profile", data);
   set({ authUser: res.data });
   toast.success("Profile updated successfully");
  } catch (error) {
   console.log("error in update profile:", error);
   toast.error(error.response?.data?.message || "Update failed");
  } finally {
   set({ isUpdatingProfile: false });
  }
 },

 connectSocket: () => {
  const { authUser } = get();
  if (!authUser || get().socket?.connected) return;

  const socket = io(BASE_URL, {
   query: { userId: authUser._id },
   withCredentials: true,
   transports: ["websocket"],
  });
  socket.connect();

  set({ socket: socket });

  socket.on("getOnlineUsers", (userIds) => {
   set({ onlineUsers: userIds });
  });
  

  socket.on("callToUser", ({ from, signal, meta }) => {
   useCallStore.getState().incomingCall({ from, offer: signal, meta });
   toast(`📞 Có cuộc gọi đến`, { id: "incoming-call", duration: 60000 });
  });

  socket.on("callAccepted", ({ signal, from }) => {
   useCallStore.getState().handleAccepted(signal, from);
  });

  socket.on("call:rejected", () => {
   toast.error("Cuộc gọi bị từ chối");
   useCallStore.getState().endCall(false); 
  });

  socket.on("call:ended", () => {
   toast("Cuộc gọi đã kết thúc");
   useCallStore.getState().endCall(false); 
  });

  // 5. Lắng nghe các lỗi từ server
  socket.on("userUnavailable", () => {
   toast.error("Người dùng đang offline.");
   useCallStore.getState().endCall(false);
  });

  socket.on("userBusy", () => {
   toast.error("Người dùng đang bận.");
   useCallStore.getState().endCall(false);
  });
 },

 disconnectSocket: () => {
  if (get().socket?.connected) {
   get().socket.disconnect();
   set({ socket: null });
  }
 },
}));