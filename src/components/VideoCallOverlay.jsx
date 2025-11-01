import { useEffect, useRef, useState } from "react";
import { useCallStore } from "../store/useCallStore";
import { PhoneOff, Video, VideoOff, Mic, MicOff } from "lucide-react";
import { Howl } from "howler";

const VideoCallOverlay = () => {
  const {
    ringing,
    inCall,
    meta,
    localStream,
    remoteStream,
    acceptCall,
    rejectCall,
    endCall,
    getPendingOffer,
    callerId,
    requestEnableVideo,
    videoEnabled,
  } = useCallStore();

  const localRef = useRef(null);
  const remoteRef = useRef(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(false); // mặc định ẩn preview

  // hiện preview khi đã có video track hoặc đã được bên kia approve
  useEffect(() => {
    const hasVideo = !!localStream?.getVideoTracks?.().length;
    setIsCamOn(videoEnabled || hasVideo);
  }, [videoEnabled, localStream]);

  // ---- CHỈ 1 HÀM toggleCam ----
  const toggleCam = () => {
    if (!isCamOn) {
      // đang tắt -> xin bên kia bật video
      requestEnableVideo();
    } else {
      // đang bật -> ngừng gửi video (không phá mic/stream)
      useCallStore.getState()._replaceOutgoingVideoTrack?.(null);
      setIsCamOn(false);
    }
  };

  const ringtone = new Howl({ src: ["/ringtone.mp3"], loop: true, volume: 1 });

  useEffect(() => {
    if (localRef.current && localStream) localRef.current.srcObject = localStream;
  }, [localStream, inCall]);

  useEffect(() => {
    if (remoteRef.current && remoteStream) remoteRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  const toggleMic = () => {
    if (!localStream) return;
    const audioTrack = localStream.getAudioTracks()[0];
    if (!audioTrack) return;
    audioTrack.enabled = !audioTrack.enabled;
    setIsMicOn(audioTrack.enabled);
  };

  if (!ringing && !inCall) return null;

  if (ringing) {
    const offer = getPendingOffer();
    useEffect(() => {
      ringtone.play();
      return () => ringtone.stop();
    }, []);
    return (
      <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center">
        <div className="bg-white p-6 rounded-2xl shadow-lg w-[320px] text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full overflow-hidden ring-4 ring-green-400 animate-pulse">
            <img src={meta?.callerAvatar || "/avatar.png"} alt="avatar" className="w-full h-full object-cover" />
          </div>
          <h3 className="font-semibold text-lg">{meta?.callerName || "Cuộc gọi đến..."}</h3>
          <div className="flex gap-4 justify-center mt-4">
            <button
              className="btn btn-success flex items-center gap-2"
              onClick={() => { ringtone.stop(); acceptCall(offer, callerId, meta); }}
            >
              <Video size={18} /> Chấp nhận
            </button>
            <button
              className="btn btn-error flex items-center gap-2"
              onClick={() => { ringtone.stop(); rejectCall(); }}
            >
              <PhoneOff size={18} /> Từ chối
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center">
      {/* Remote */}
      <video
        ref={remoteRef}
        autoPlay
        playsInline
        className={`w-full h-full object-contain transition-opacity duration-500 ${
          remoteStream ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Local preview: chỉ hiển thị khi isCamOn */}
      {isCamOn && (
        <div className="absolute bottom-28 right-5 bg-gray-900/80 rounded-xl overflow-hidden shadow-lg border-2 border-white">
          <video
            ref={localRef}
            autoPlay
            muted
            playsInline
            className="w-32 h-44 md:w-48 md:h-56 object-cover transform -scale-x-100"
          />
        </div>
      )}

      {/* Overlay chờ */}
      {!remoteStream && inCall && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center pointer-events-none">
          <div className="relative flex flex-col items-center mb-6">
            <img
              src={meta?.calleeAvatar || meta?.callerAvatar || "/avatar.png"}
              alt="avatar"
              className="w-28 h-28 rounded-full border-4 border-blue-500 animate-bounce-slow shadow-lg"
            />
            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-16 h-2 bg-blue-500/40 blur-md rounded-full animate-pulse" />
          </div>
          <h3 className="text-xl md:text-2xl font-semibold">{meta?.calleeName || meta?.callerName || "Đang kết nối..."}</h3>
          <p className="text-sm text-gray-300 italic animate-pulse">Đang chờ người nhận trả lời...</p>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-5">
        <button onClick={() => endCall(true)} className="btn btn-error btn-circle btn-lg" title="Kết thúc">
          <PhoneOff size={24} />
        </button>
        <button
          onClick={toggleMic}
          className={`btn ${isMicOn ? "btn-success" : "btn-error"} btn-circle btn-lg`}
          title={isMicOn ? "Tắt mic" : "Bật mic"}
        >
          {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
        <button
          onClick={toggleCam}
          className={`btn ${isCamOn ? "btn-success" : "btn-error"} btn-circle btn-lg`}
          title={isCamOn ? "Tắt camera" : "Bật camera"}
        >
          {isCamOn ? <Video size={24} /> : <VideoOff size={24} />}
        </button>
      </div>
    </div>
  );
};

export default VideoCallOverlay;
