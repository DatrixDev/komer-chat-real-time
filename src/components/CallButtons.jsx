// src/components/CallButtons.jsx
import { Video, Phone } from "lucide-react";
import { useCallStore } from "../store/useCallStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const CallButtons = ({ receiver }) => {
  const { authUser } = useAuthStore();
  const startCall = useCallStore((state) => state.startCall);

  const handleStartCall = (isVideo) => {
    if (!receiver?._id) return toast.error("Không tìm thấy người nhận!");

    startCall(receiver._id, {
      calleeName: receiver.fullName,
      calleeAvatar: receiver.profilePic,
      callerName: authUser.fullName,
      callerAvatar: authUser.profilePic,
      isVideo, // ✅ quan trọng
    });
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleStartCall(false)}
        className="btn btn-sm btn-circle btn-outline hover:bg-blue-500 hover:text-white"
        title="Gọi thoại"
      >
        <Phone size={18} />
      </button>

      <button
        onClick={() => handleStartCall(true)}
        className="btn btn-sm btn-circle btn-outline hover:bg-green-500 hover:text-white"
        title="Gọi video"
      >
        <Video size={18} />
      </button>
    </div>
  );
};

export default CallButtons;
