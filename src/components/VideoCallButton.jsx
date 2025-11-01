import { Phone } from "lucide-react";
import { useCallStore } from "../store/useCallStore";
import { useAuthStore } from "../store/useAuthStore";

const VideoCallButton = ({ receiver }) => {
  const startCall = useCallStore((s) => s.startCall);
  const { authUser } = useAuthStore();

  const handleStart = async () => {
    await startCall(receiver._id, {
      callerName: authUser.fullName,
      callerAvatar: authUser.profilePic,
      calleeName: receiver.fullName,
      calleeAvatar: receiver.profilePic,
    });
  };

  return (
    <button onClick={handleStart} className="btn btn-circle btn-sm" title="Gọi video">
      <Phone size={18} />
    </button>
  );
};

export default VideoCallButton;
