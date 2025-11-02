import { useEffect } from "react";
import { motion } from "framer-motion";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useSidebarStore } from "../store/useSidebarStore";
import { Search, MessageCircle, Home, Circle } from "lucide-react";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Link } from "react-router-dom";

// Cập nhật interface này để code "biết" về các trường dữ liệu mới
// (ngay cả khi chúng chưa có)
interface User {
  _id: string;
  fullName: string;
  profilePic?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number; // Trường "tính sau"
  isGroup?: boolean;
}

const Messages = () => {
  const { sidebarMode } = useSidebarStore();
  const { users, getUsers, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();
  const { onlineUsers, authUser } = useAuthStore();

  useEffect(() => {
    if (sidebarMode === "chat") getUsers();
  }, [sidebarMode, getUsers]);

  // 1. THÊM HÀM THỜI GIAN TƯƠNG ĐỐI (thay cho hàm formatTime cũ)
  const formatRelativeTime = (isoString: string | undefined) => {
    if (!isoString) return "";

    const now = new Date();
    const date = new Date(isoString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} ngày`;
    if (hours > 0) return `${hours} giờ`;
    if (minutes > 0) return `${minutes} phút`;
    return "Vừa xong";
  };

  if (sidebarMode !== "chat") return null;
  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-full flex flex-col">
      <div className="border-b border-base-300 w-full p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="w-7 h-7" />
            <span>Tin nhắn</span>
          </h2>
          <Link
            to="/"
            onClick={() => setSelectedUser(null)}
            className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 text-gray-500 hover:text-primary transition-colors"
            title="Trang chủ"
          >
            <Home className="w-5 h-5" />
          </Link>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm hội thoại..."
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {users.length === 0 ? (
          <p className="text-center text-zinc-400">Không có người dùng nào</p>
        ) : (
          users
            .filter((user: User) => user._id !== authUser?._id)
            .map((user: User) => (
              <motion.div
                key={user._id}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setSelectedUser(user);
                  useChatStore.getState().markMessagesAsRead(user._id);
                }}
                className={`p-3 rounded-lg cursor-pointer transition-all mb-2 ${
                  selectedUser?._id === user._id
                    ? "bg-gray-700"
                    : "hover:bg-gray-800"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {onlineUsers.includes(user._id) && !user.isGroup && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-gray-900 rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 overflow-hidden">
                    <h3 className="font-semibold text-sm text-white mb-1 truncate block">
                      {user.fullName}
                    </h3>
                    <p className="text-xs text-gray-400 truncate block">
                      {user.lastMessage || "Bắt đầu trò chuyện"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-auto">
                    <span className="text-xs text-gray-500">
                      {user.lastMessageTime
                        ? formatRelativeTime(user.lastMessageTime)
                        : ""}
                    </span>

                    {user.unreadCount && user.unreadCount > 0 ? (
                      <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {user.unreadCount > 9 ? "9+" : user.unreadCount}
                      </span>
                    ) : (
                      <div className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))
        )}
      </div>
    </aside>
  );
};

export default Messages;
