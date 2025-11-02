import { useEffect, useState } from "react";
import { Users, UserPlus, Search } from "lucide-react"; // Import Search
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendStore } from "../store/useFriendStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { useSidebarStore } from "../store/useSidebarStore";

const Sidebar = () => {
  const { sidebarMode } = useSidebarStore();
  const { setSelectedUser, selectedUser } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const {
    friends,
    requests,
    fetchFriends,
    fetchRequests,
    sendRequest,
    acceptRequest,
    removeFriend,
    cancelRequest,
  } = useFriendStore();

  const [activeTab, setActiveTab] = useState("friends");
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpenUserId, setMenuOpenUserId] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  const socket = useAuthStore((s) => s.socket);
  useEffect(() => {
    if (!socket) return;

    socket.on("friendRequestReceived", () => {
      fetchRequests();
    });

    socket.on("friendRequestAccepted", () => {
      fetchFriends();
      fetchRequests();
    });

    return () => {
      socket.off("friendRequestReceived");
      socket.off("friendRequestAccepted");
    };
  }, [socket, fetchFriends, fetchRequests]);

  const handleMenuClick = (e, userId) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 4,
      left: rect.left - 80,
    });
    setMenuOpenUserId((prev) => (prev === userId ? null : userId));
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchFriends(), fetchRequests()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchFriends, fetchRequests]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/messages/users", {
          credentials: "include",
        });
        const data = await res.json();
        setAllUsers(data);
      } catch (err) {
        console.log("Lỗi tải danh sách user:", err);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setMenuOpenUserId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  if (isLoading) return <SidebarSkeleton />;

  const renderTabContent = () => {
    switch (activeTab) {
      case "friends":
        return (
          <>
            {friends.length === 0 && (
              <div className="text-center text-zinc-500 py-4">
                Bạn chưa có bạn bè nào
              </div>
            )}
            {friends.map((user) => (
              <div
                key={user._id}
                className={`group w-full p-3 flex items-center justify-between hover:bg-base-300 transition-colors rounded-lg
      ${
        selectedUser?._id === user._id
          ? "bg-base-300 ring-1 ring-base-300"
          : ""
      }`}
                onClick={() => {
                  setSelectedUser(user);
                  setMenuOpenUserId(null);
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                      className="size-12 object-cover rounded-full"
                    />
                    {onlineUsers.includes(user._id) && (
                      <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                    )}
                  </div>
                  {/* SỬA ĐỔI: Ẩn text khi ở md (w-20) */}
                  <div className="text-left min-w-0 inline md:hidden lg:inline">
                    <div className="font-medium truncate">{user.fullName}</div>
                    <div className="text-sm text-zinc-400">
                      {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                    </div>
                  </div>
                </div>

                <div className="relative inline md:hidden lg:inline">
                  <button
                    onClick={(e) => handleMenuClick(e, user._id)}
                    className="btn btn-ghost btn-xs px-2"
                  >
                    ⋯
                  </button>

                  {menuOpenUserId === user._id && dropdownPos.top !== 0 && (
                    <div
                      className={`fixed z-[9999] bg-base-100 border border-base-300 rounded-lg 
                            shadow-[0_4px_12px_rgba(0,0,0,0.1)] w-32 transition-all duration-200 
                            ease-out transform origin-top ${
                              menuOpenUserId === user._id
                                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                                : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                            }`}
                      style={{
                        top: dropdownPos.top,
                        left: dropdownPos.left,
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFriend(user._id);
                          setMenuOpenUserId(null);
                        }}
                        className="flex items-center gap-2 w-full text-left px-3 py-2 
                                  text-sm text-red-500 hover:bg-base-200 transition-colors"
                      >
                        ❌ Xóa bạn
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        );

      case "requests":
        return (
          // SỬA ĐỔI: Ẩn toàn bộ nội dung tab này khi ở md (w-20)
          <div className="inline md:hidden lg:inline">
            <h3 className="font-semibold mb-2">Lời mời đến</h3>
            {requests.received.length === 0 ? (
              <div className="text-center text-zinc-500 py-4">
                Không có lời mời nào
              </div>
            ) : (
              requests.received.map((req) => (
                <div
                  key={req._id}
                  className="flex items-center justify-between bg-base-200 p-2 rounded-lg mb-2"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={req.profilePic || "/avatar.png"}
                      alt={req.fullName}
                      className="size-10 rounded-full object-cover"
                    />
                    <span className="font-medium">{req.fullName}</span>
                  </div>
                  <button
                    onClick={() => acceptRequest(req._id)}
                    className="btn btn-xs btn-primary"
                  >
                    Chấp nhận
                  </button>
                </div>
              ))
            )}

            <h3 className="font-semibold mt-4 mb-2">Đã gửi</h3>
            {requests.sent.length === 0 ? (
              <div className="text-center text-zinc-500 py-4">
                Bạn chưa gửi lời mời nào
              </div>
            ) : (
              requests.sent.map((req) => (
                <div
                  key={req._id}
                  className="flex items-center justify-between bg-base-200 p-2 rounded-lg mb-2"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={req.profilePic || "/avatar.png"}
                      alt={req.fullName}
                      className="size-10 rounded-full object-cover"
                    />
                    <span className="font-medium">{req.fullName}</span>
                  </div>
                  <span className="text-xs text-zinc-500">Đã gửi</span>
                </div>
              ))
            )}
          </div>
        );

      case "all":
        return (
          // SỬA ĐỔI: Ẩn toàn bộ nội dung tab này khi ở md (w-20)
          <div className="inline md:hidden lg:inline">
            <h3 className="font-semibold mb-2">Tất cả người dùng</h3>
            {allUsers
              .filter((user) => {
                if (!user || !user.fullName) return false;
                if (user._id === authUser._id) return false;

                return user.fullName
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase());
              })
              .map((user) => {
                const isFriend = friends.some((f) => f._id === user._id);
                const isSent = requests.sent.some((r) => r._id === user._id);
                const isReceived = requests.received.some(
                  (r) => r._id === user._id
                );

                return (
                  <div
                    key={user._id}
                    className="flex items-center justify-between bg-base-200 p-2 rounded-lg mb-2"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.fullName || "Người dùng"}
                        className="size-10 rounded-full object-cover"
                      />
                      <span className="font-medium">
                        {user.fullName || "Người dùng"}
                      </span>
                    </div>

                    {isFriend ? (
                      <button
                        onClick={() => removeFriend(user._id)}
                        className="btn btn-xs btn-error btn-outline"
                      >
                        Hủy kết bạn
                      </button>
                    ) : isSent ? (
                      <button
                        onClick={() => cancelRequest(user._id)}
                        className="btn btn-xs btn-outline btn-warning"
                      >
                        Hủy gửi
                      </button>
                    ) : isReceived ? (
                      <span className="text-xs text-zinc-500">Đã gửi bạn</span>
                    ) : (
                      <button
                        onClick={() => sendRequest(user._id)}
                        className="btn btn-xs btn-outline"
                      >
                        <UserPlus className="size-3 mr-1" /> Kết bạn
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        );
    }
  };

  return (
    <>
      {sidebarMode === "friend" && (
        // SỬA ĐỔI CHÍNH: Xóa w-20, lg:w-72, border-r, và transition
        // Thêm w-full để nó nhận chiều rộng từ component cha (HomePage)
        <aside className="h-full w-full flex flex-col">
          {/* Header */}
          <div className="border-b border-base-300 w-full p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Users className="size-6" />
              {/* SỬA ĐỔI: Ẩn text khi ở md (w-20) */}
              <span className="font-semibold text-lg inline md:hidden lg:inline">
                Liên hệ
              </span>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 justify-between">
              {/* SỬA ĐỔI: Ẩn text khi ở md (w-20) */}
              <button
                className={`btn btn-xs flex-1 ${
                  activeTab === "all" ? "btn-primary" : "btn-ghost"
                }`}
                onClick={() => setActiveTab("all")}
              >
                <span className="inline md:hidden lg:inline">Mọi người</span>
              </button>
              <button
                className={`btn btn-xs flex-1 ${
                  activeTab === "requests" ? "btn-primary" : "btn-ghost"
                }`}
                onClick={() => setActiveTab("requests")}
              >
                <span className="inline md:hidden lg:inline">Lời mời</span>
              </button>
              <button
                className={`btn btn-xs flex-1 ${
                  activeTab === "friends" ? "btn-primary" : "btn-ghost"
                }`}
                onClick={() => setActiveTab("friends")}
              >
                <span className="inline md:hidden lg:inline">Bạn bè</span>
              </button>
            </div>

            {/* SỬA ĐỔI: Ẩn search khi ở md (w-20) */}
            {activeTab === "all" && (
              <div className="relative mt-2 inline md:hidden lg:inline">
                <input
                  type="text"
                  placeholder="Tìm kiếm người dùng..."
                  className="input input-sm input-bordered w-full pl-8"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {/* Thay thế SVG bằng Lucide Icon cho nhất quán */}
                <Search className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              </div>
            )}
          </div>

          {/* Nội dung */}
          <div className="overflow-y-auto w-full py-3 px-2">
            {renderTabContent()}
          </div>
        </aside>
      )}
    </>
  );
};

export default Sidebar;