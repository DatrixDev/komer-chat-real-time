import { useChatStore } from "../store/useChatStore";
import { useSidebarStore } from "../store/useSidebarStore";

import SidebarChat from "../components/SidebarChat"; // Component này sẽ render <Messages />
import Sidebar from "../components/SidebarFriend";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const { sidebarMode } = useSidebarStore();

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-8xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden ">
            {/* Div này chịu trách nhiệm co giãn, đã đúng */}
            <div
              className={`${
                selectedUser ? "hidden md:flex" : "flex"
              } flex-col w-full md:w-20 lg:w-72 border-r border-base-300 transition-all duration-200`}
            >
              {sidebarMode === "chat" && <SidebarChat />}
              {sidebarMode === "friend" && <Sidebar />}
            </div>

            <div
              className={`${
                !selectedUser
                  ? "hidden md:flex md:flex-1 flex-col transition-all duration-200"
                  : "flex flex-1 flex-col transition-all duration-200"
              }`}
            >
              {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;