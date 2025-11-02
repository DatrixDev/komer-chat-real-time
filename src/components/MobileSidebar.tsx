import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/useAuthStore";
import { useSidebarStore } from "../store/useSidebarStore";
import { useChatStore } from "../store/useChatStore";
import {
  LogOut,
  Settings,
  User,
  Users,
  MessageSquare,
  X,
} from "lucide-react";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  const { logout, authUser } = useAuthStore();
  const { setSidebarMode } = useSidebarStore();
  const { setSelectedUser } = useChatStore();

  const handleItemClick = (action?: () => void) => {
    if (action) action();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-40 md:hidden"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="fixed top-0 right-0 w-3/4 sm:w-2/5 h-full 
                       bg-base-100 z-50 shadow-2xl border-l border-base-300 
                       flex flex-col items-start py-8 px-6 space-y-4
                       " 
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-base-200"
            >
              <X size={24} />
            </button>

            <NavLink
              to="/settings"
              onClick={() => handleItemClick()}
              className="flex items-center gap-3 text-lg font-medium w-full py-2 px-4 rounded-lg hover:bg-base-200"
            >
              <Settings className="size-5" /> Cài đặt
            </NavLink>

            <button
              onClick={() =>
                handleItemClick(() => {
                  setSidebarMode("chat");
                  setSelectedUser(null);
                })
              }
              className="flex items-center gap-3 text-lg font-medium w-full py-2 px-4 rounded-lg hover:bg-base-200"
            >
              <MessageSquare className="size-5" /> Tin nhắn
            </button>

            <button
              onClick={() =>
                handleItemClick(() => {
                  setSidebarMode("friend");
                  setSelectedUser(null);
                })
              }
              className="flex items-center gap-3 text-lg font-medium w-full py-2 px-4 rounded-lg hover:bg-base-200"
            >
              <Users className="size-5" /> Bạn bè
            </button>

            {authUser && (
              <>
                <NavLink
                  to="/profile"
                  onClick={() => handleItemClick()}
                  className="flex items-center gap-3 text-lg font-medium w-full py-2 px-4 rounded-lg hover:bg-base-200"
                >
                  <User className="size-5" /> Hồ sơ
                </NavLink>

                <button
                  onClick={() =>
                    handleItemClick(() => {
                      logout();
                    })
                  }
                  className="flex items-center gap-3 text-lg font-medium w-full py-2 px-4 rounded-lg hover:bg-red-100 text-red-600"
                >
                  <LogOut className="size-5" /> Đăng xuất
                </button>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileSidebar;