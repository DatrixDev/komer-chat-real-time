import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  _subscribed: false, 

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/friends");
      set({ users: res.data });
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi tải danh sách người dùng");
      return [];
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi tải tin nhắn");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      const newMsg = res.data;
      set({ messages: [...messages, newMsg] });

      set((state) => ({
        users: state.users.map((u) =>
          u._id === state.selectedUser._id
            ? {
                ...u,
                lastMessage: newMsg.text || "[Hình ảnh]",
                lastMessageTime: newMsg.createdAt,
                unreadCount: 0,
              }
            : u
        ),
      }));

      const socket = useAuthStore.getState().socket;
      if (socket) socket.emit("newMessage", newMsg);
    } catch (error) {
      toast.error(error.response?.data?.message || "Gửi tin nhắn thất bại");
    }
  },

  markMessagesAsRead: (userId) => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.emit("markAsRead", userId);
    set((state) => ({
      users: state.users.map((u) =>
        u._id === userId ? { ...u, unreadCount: 0 } : u
      ),
    }));
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket || get()._subscribed) return;

    set({ _subscribed: true });
    console.log("✅ Subscribed socket only once");

    socket.on("newMessage", (newMessage) => {
      const { selectedUser } = get();

      if (
        selectedUser &&
        (newMessage.senderId === selectedUser._id ||
          newMessage.receiverId === selectedUser._id)
      ) {
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));

        if (newMessage.senderId === selectedUser._id) {
          socket.emit("markAsRead", selectedUser._id);
        }

        set((state) => ({
          users: state.users.map((u) =>
            u._id === selectedUser._id
              ? {
                  ...u,
                  lastMessage: newMessage.text || "[Hình ảnh]",
                  lastMessageTime: newMessage.createdAt,
                  unreadCount: 0,
                }
              : u
          ),
        }));
      } else {
        set((state) => ({
          users: state.users.map((u) =>
            u._id === newMessage.senderId
              ? {
                  ...u,
                  unreadCount: (u.unreadCount || 0) + 1,
                  lastMessage: newMessage.text || "[Hình ảnh]",
                  lastMessageTime: newMessage.createdAt,
                }
              : u
          ),
        }));
      }
    });

    socket.on("messagesRead", (readerId) => {
      set((state) => ({
        users: state.users.map((u) =>
          u._id === readerId ? { ...u, unreadCount: 0 } : u
        ),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.off("messagesRead");
    set({ _subscribed: false });
    console.log("❌ Socket unsubscribed");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
