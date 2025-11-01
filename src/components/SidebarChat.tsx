import { useEffect } from "react";
import { motion } from "framer-motion";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useSidebarStore } from "../store/useSidebarStore";
import { Search, MessageCircle, Home, Circle } from "lucide-react";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Link } from "react-router-dom";

// Định nghĩa kiểu cho user (có thể mở rộng khi backend thêm trường)
interface User {
  _id: string;
  fullName: string;
  profilePic?: string;
  email?: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

const Messages = () => {
  const { sidebarMode } = useSidebarStore();
  const { users, getUsers, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();
  const { onlineUsers, authUser } = useAuthStore();

  // Lấy danh sách user khi sidebarMode = "chat"
  useEffect(() => {
    if (sidebarMode === "chat") getUsers();
  }, [sidebarMode, getUsers]);

  // Format giờ hiển thị
  const formatTime = (isoString: string | undefined) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Nếu không phải mode chat thì ẩn
  if (sidebarMode !== "chat") return null;

  // Loading skeleton
  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Header */}
      <div className="border-b border-base-300 w-full p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="w-7 h-7" />
            Tin nhắn
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

        {/* Ô tìm kiếm */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm hội thoại..."
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Danh sách hội thoại */}
      <div className="flex-1 overflow-y-auto p-3">
        {users.length === 0 ? (
          <p className="text-center text-zinc-400">Không có người dùng nào</p>
        ) : (
          users
            // Lọc bỏ chính mình
            .filter((user: User) => user._id !== authUser?._id)
            .map((user: User) => (
              <motion.div
                key={user._id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedUser(user)}
                className={`p-3 rounded-lg cursor-pointer transition-all mb-2 ${
                  selectedUser?._id === user._id
                    ? "bg-blue-50 border border-blue-300"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar + trạng thái online */}
                  <div className="relative">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {onlineUsers.includes(user._id) && (
                      <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-green-500 text-green-500" />
                    )}
                  </div>

                  {/* Tên + tin nhắn gần nhất */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm truncate">
                        {user.fullName}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {user.lastMessageTime
                          ? formatTime(user.lastMessageTime)
                          : ""}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {user.lastMessage || "Bắt đầu trò chuyện"}
                    </p>
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
