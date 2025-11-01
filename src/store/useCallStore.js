import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import Peer from "simple-peer/simplepeer.min.js";
import toast from "react-hot-toast";
import { Howl } from "howler";
const ringtone = new Howl({
  src: ["/ringtone.mp3"],
  loop: true,
  volume: 1.0,
});
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
  _getMedia: async () => {
    const { localStream: oldStream } = get();
    if (oldStream) {
      oldStream.getTracks().forEach((t) => t.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (!stream) {
        throw new Error("Không lấy được camera/micro");
      }
      console.log("🎥 Stream hợp lệ:", {
        video: stream.getVideoTracks().length,
        audio: stream.getAudioTracks().length,
      });

      set({ localStream: stream });
      return stream;
    } catch (err) {
      console.error("Không thể truy cập camera/mic:", err);
      toast.error("Vui lòng cấp quyền camera và micro!");
      return null;
    }
  },
  startCall: async (calleeId, meta) => {
    ringtone.play();
    const socket = useAuthStore.getState().socket;
    const { authUser } = useAuthStore.getState();

    if (!socket) {
      toast.error("Socket chưa kết nối!");
      return;
    }

    const stream = await get()._getMedia();
    if (!stream) {
      console.warn(" Stream chưa sẵn sàng → Dừng startCall()");
      return;
    }

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    set({ inCall: true, meta, calleeId, peer });
    peer.on("signal", (signalData) => {
      console.log("Gửi offer → callToUser");
      socket.emit("callToUser", {
        callToUserId: calleeId,
        signalData,
        from: authUser._id,
        meta,
      });
    });
    peer.on("stream", (remoteStream) => {
      console.log("Caller nhận remote stream");
      set({ remoteStream });
    });

    peer.on("error", (err) => {
      console.error("Lỗi Peer (Caller):", err);
      toast.error("Lỗi khi bắt đầu cuộc gọi!");
      get().endCall(true);
    });
    peer.on("stream", () => {
      ringtone.stop();
    });
  },

  acceptCall: async (offer, from, meta) => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return toast.error("Socket chưa kết nối!");

    const stream = await get()._getMedia();
    if (!stream) {
      console.warn("Stream chưa sẵn sàng → Dừng acceptCall()");
      return;
    }

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    set({ inCall: true, ringing: false, callerId: from, meta, peer });

    peer.on("signal", (signalData) => {
      console.log("📤 Gửi answer → answeredCall");
      socket.emit("answeredCall", { signal: signalData, to: from });
    });

    peer.on("stream", (remoteStream) => {
      console.log("Receiver nhận remote stream");
      set({ remoteStream });
    });

    peer.on("error", (err) => {
      console.error("Lỗi Peer (Receiver):", err);
      toast.error("Không thể nhận cuộc gọi!");
      get().endCall(true);
    });

    if (offer) {
      try {
        peer.signal(offer);
      } catch (err) {
        console.error("⚠️ Lỗi signal khi accept:", err);
      }
    } else {
      console.warn("⚠️ Không có offer hợp lệ để signal");
    }
  },
  rejectCall: () => {
    const socket = useAuthStore.getState().socket;
    const { callerId } = get();
    if (socket && callerId) {
      socket.emit("reject-call", { to: callerId });
    }
    set({
      ringing: false,
      callerId: null,
      meta: null,
      _pendingOffer: null,
    });
  },
  endCall: (shouldEmit = true, silent = false) => {
    const socket = useAuthStore.getState().socket;
    const { peer, localStream, callerId, calleeId } = get();
    const otherUser = callerId || calleeId;

    ringtone?.stop?.();

    if (shouldEmit && socket && otherUser) {
      socket.emit("call:end", { to: otherUser });
    }

    if (peer) peer.destroy();
    if (localStream) localStream.getTracks().forEach((t) => t.stop());

    set({
      inCall: false,
      ringing: false,
      callerId: null,
      calleeId: null,
      peer: null,
      localStream: null,
      remoteStream: null,
      meta: null,
      _pendingOffer: null,
    });

    if (!silent) toast("Cuộc gọi đã kết thúc");
  },

  handleAccepted: (answerSignal, from) => {
    const { peer } = get();
    if (peer) {
      console.log("Caller nhận answer → kết nối hoàn tất");
      peer.signal(answerSignal);
    } else {
      console.warn("Peer chưa tồn tại khi nhận answer!");
    }
  },

  incomingCall: ({ from, offer, meta }) => {
    const socket = useAuthStore.getState().socket;
    if (get().inCall || get().ringing) {
      console.log("Đang bận, tự động từ chối");
      if (socket) socket.emit("reject-call", { to: from });
      return;
    }
    set({ ringing: true, callerId: from, meta, _pendingOffer: offer });
  },

  getPendingOffer: () => get()._pendingOffer,
}));
