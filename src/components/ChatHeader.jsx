import { X, ArrowLeft, Circle } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import VideoCallButton from "./VideoCallButton";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="p-2.5 border-b border-base-300 bg-base-100">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedUser(null)}
            className="block md:hidden p-2 rounded-full hover:bg-base-200 transition"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="avatar relative">
            <div className="size-10 rounded-full overflow-hidden ring-1 ring-base-300">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
              />
            </div>
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-base-100 ${
                isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            />
          </div>

          <div>
            <h3 className="font-medium text-base">{selectedUser.fullName}</h3>
            <div className="flex items-center gap-1 text-sm text-base-content/70">
              <span>{isOnline ? "Đang hoạt động" : "Ngoại tuyến"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <VideoCallButton receiver={selectedUser} />
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
