import { X, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import CallButtons from "./CallButtons";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  return (
    <div className="p-2.5 border-b border-base-300 bg-base-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedUser(null)}
            className="block md:hidden p-2 rounded-full hover:bg-base-200 transition"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
              />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id)
                ? "Đang hoạt động"
                : "Ngoại tuyến"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CallButtons  receiver={selectedUser} />
          <button
            onClick={() => setSelectedUser(null)}
            className="hidden md:block p-2 rounded-full hover:bg-base-200 transition"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
