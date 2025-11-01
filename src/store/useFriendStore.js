import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useFriendStore = create((set, get) => ({
  friends: [],
  requests: { received: [], sent: [] },

  fetchFriends: async () => {
    try {
      const res = await axiosInstance.get("/friends");
      set({ friends: res.data });
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi tải danh sách bạn");
    }
  },

  fetchRequests: async () => {
    try {
      const res = await axiosInstance.get("/friends/requests");
      set({ requests: res.data });
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi tải lời mời");
    }
  },

  sendRequest: async (userId) => {
    try {
      const res = await axiosInstance.post(`/friends/request/${userId}`);
      toast.success(res.data.message);
      await get().fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Không gửi được lời mời");
    }
  },

  acceptRequest: async (userId) => {
    try {
      const res = await axiosInstance.post(`/friends/accept/${userId}`);
      toast.success(res.data.message);
      await Promise.all([get().fetchFriends(), get().fetchRequests()]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể chấp nhận");
    }
  },

  cancelRequest: async (userId) => {
    try {
      const res = await axiosInstance.delete(`/friends/cancel/${userId}`);
      toast.success(res.data.message);
      await get().fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể hủy lời mời");
    }
  },

  removeFriend: async (userId) => {
    try {
      const res = await axiosInstance.delete(`/friends/${userId}`);
      toast.success(res.data.message);
      await get().fetchFriends();
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể hủy kết bạn");
    }
  },
}));
