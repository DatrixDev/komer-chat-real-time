import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import Peer from "simple-peer/simplepeer.min.js";
import toast from "react-hot-toast";
import { Howl } from "howler";

const ringtone = new Howl({ src: ["/ringtone.mp3"], loop: true, volume: 1 });

export const useCallStore = create((set, get) => ({
  inCall: false,
  ringing: false,
  callerId: null,
  calleeId: null,
  peer: null,
  localStream: null,
  remoteStream: null,
  meta: null,
  _pendingOffer: null,
  videoEnabled: false, // trạng thái “đang gửi video”

  // ---------- Media ----------
   _replaceOutgoingVideoTrack: async (trackOrNull) => {
    const { peer, localStream } = get();
    if (!peer) return;

    const pc = peer._pc; // simple-peer exposes native RTCPeerConnection
    const senders = pc.getSenders ? pc.getSenders() : [];
    const videoSender = senders.find(s => s.track && s.track.kind === "video");

    if (trackOrNull) {
      if (videoSender) {
        await videoSender.replaceTrack(trackOrNull);
      } else {
        // chưa có sender video -> addTrack và yêu cầu renegotiate
        pc.addTrack(trackOrNull, localStream || new MediaStream([trackOrNull]));
        if (peer._needsNegotiation) peer._needsNegotiation(); // simple-peer trigger
      }
    } else {
      // tắt video -> thay bằng null (giữ cuộc gọi không rớt)
      if (videoSender && videoSender.replaceTrack) {
        await videoSender.replaceTrack(null);
      }
    }
  },
  _getMedia: async (isVideo = true) => {
    const { localStream: old } = get();
    if (old) old.getTracks().forEach(t => t.stop());

    try {
      const constraints = isVideo ? { video: true, audio: true } : { video: false, audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      set({ localStream: stream });
      return stream;
    } catch (e) {
      console.error(e);
      toast.error("Vui lòng cấp quyền micro/camera!");
      return null;
    }
  },

  // Helper: thay track video gửi đi (bật/tắt mượt)
  _replaceOutgoingVideoTrack: (trackOrNull) => {
    const { peer } = get();
    if (!peer || !peer._pc) return;
    const sender = peer._pc.getSenders().find(s => s.track && s.track.kind === "video");
    if (sender) sender.replaceTrack(trackOrNull);
  },

  // ---------- Caller start ----------
  startCall: async (calleeId, meta) => {
    const socket = useAuthStore.getState().socket;
    const { authUser } = useAuthStore.getState();
    if (!socket) return toast.error("Socket chưa kết nối!");

    const isVideo = !!meta?.isVideo; // gọi video hay thoại
    const stream = await get()._getMedia(isVideo);
    if (!stream) return;

    ringtone.play();

    const peer = new Peer({ initiator: true, trickle: false, stream });
    set({ inCall: true, meta, calleeId, peer, videoEnabled: isVideo });

    peer.on("signal", (signalData) => {
      socket.emit("callToUser", {
        callToUserId: calleeId,
        signalData,
        from: authUser._id,
        meta: { ...meta, isVideo },
      });
    });

    peer.on("stream", (remoteStream) => {
      ringtone.stop();
      set({ remoteStream });
    });

    peer.on("error", (err) => {
      console.error("Peer error (caller)", err);
      get().endCall(true);
    });
  },

  // ---------- Receiver accept ----------
  acceptCall: async (offer, from, meta) => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return toast.error("Socket chưa kết nối!");

    const isVideo = !!meta?.isVideo;
    const stream = await get()._getMedia(isVideo);
    if (!stream) return;

    ringtone.stop();

    const peer = new Peer({ initiator: false, trickle: false, stream });
    set({ inCall: true, ringing: false, callerId: from, meta, peer, videoEnabled: isVideo });

    peer.on("signal", (signalData) => {
      socket.emit("answeredCall", { signal: signalData, to: from });
    });

    peer.on("stream", (remoteStream) => set({ remoteStream }));

    peer.on("error", (err) => {
      console.error("Peer error (receiver)", err);
      get().endCall(true);
    });

    if (offer) peer.signal(offer);
  },

  // ---------- Reject / End ----------
  rejectCall: () => {
    const socket = useAuthStore.getState().socket;
    const { callerId } = get();
    ringtone.stop();
    if (socket && callerId) socket.emit("reject-call", { to: callerId });
    set({ ringing: false, callerId: null, meta: null, _pendingOffer: null });
  },

  endCall: (shouldEmit = true) => {
    const socket = useAuthStore.getState().socket;
    const { peer, localStream, callerId, calleeId } = get();
    const otherUser = callerId || calleeId;
    ringtone.stop();

    if (shouldEmit && socket && otherUser) socket.emit("call:end", { to: otherUser });
    if (peer) peer.destroy();
    if (localStream) localStream.getTracks().forEach(t => t.stop());

    set({
      inCall: false, ringing: false,
      callerId: null, calleeId: null,
      peer: null, localStream: null, remoteStream: null,
      meta: null, _pendingOffer: null, videoEnabled: false,
    });

    toast("📴 Cuộc gọi đã kết thúc");
  },

  // ---------- Simple-peer answer received by caller ----------
  handleAccepted: (answerSignal) => {
    const { peer } = get();
    if (!peer) return;
    ringtone.stop();
    peer.signal(answerSignal);
  },

  // ---------- Incoming call ----------
  incomingCall: ({ from, offer, meta }) => {
    const socket = useAuthStore.getState().socket;
    if (get().inCall || get().ringing) {
      if (socket) socket.emit("reject-call", { to: from });
      return;
    }
    ringtone.play();
    set({ ringing: true, callerId: from, meta, _pendingOffer: offer });
    toast(`📞 Cuộc gọi ${meta?.isVideo ? "video" : "thoại"} đến`);
  },

  getPendingOffer: () => get()._pendingOffer,

  // ---------- Request/Approve enable video ----------
  requestEnableVideo: () => {
    const socket = useAuthStore.getState().socket;
    const { callerId, calleeId } = get();
    const to = callerId || calleeId;
    if (!socket || !to) return;
    socket.emit("request-enable-video", { to });
    toast("📹 Đã gửi yêu cầu bật video...");
  },

  handleVideoRequest: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("incoming-video-request", () => {
      toast((t) => (
        <div className="flex flex-col items-start">
          <p>📹 Người bên kia muốn bật video</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                get().enableVideo();
                const { callerId, calleeId } = get();
                const to = callerId || calleeId;   // CHỐT: gửi đúng đối phương
                socket.emit("approve-enable-video", { to });
                toast.dismiss(t.id);
              }}
              className="btn btn-xs btn-success"
            >
              Đồng ý
            </button>
            <button onClick={() => toast.dismiss(t.id)} className="btn btn-xs btn-error">
              Từ chối
            </button>
          </div>
        </div>
      ));
    });

    socket.on("video-approved", () => {
      get().enableVideo();
      toast.success("🎥 Video đã được bật!");
    });
  },

  enableVideo: async () => {
    const newStream = await get()._getMedia(true);
    if (!newStream) return;
    const videoTrack = newStream.getVideoTracks()[0] || null;
    get()._replaceOutgoingVideoTrack(videoTrack);
    set({ localStream: newStream, videoEnabled: !!videoTrack });
  },
}));
