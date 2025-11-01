import { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
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
  Menu,
  X,
} from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { sidebarMode, setSidebarMode } = useSidebarStore();
  const { setSelectedUser } = useChatStore();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-50 backdrop-blur-lg">
      <div className="mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          onClick={() => {
            setSidebarMode("chat");
            setSelectedUser(null);
          }}
          className="flex items-center gap-2.5 hover:opacity-80 transition-all"
        >
          <h1 className="text-2xl font-bold text-base-content">
            K<span className="text-red-600">Ö</span>MER
          </h1>
        </Link>

        {/* Nút menu mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-base-200 transition"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Thanh menu chính (desktop) */}
        <nav className="hidden md:flex items-center gap-3">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center justify-center gap-2 w-32 px-3 py-2 rounded-xl shadow-sm transition-all ${
                isActive
                  ? "bg-primary text-primary-content"
                  : "bg-base-200 hover:bg-base-300 text-base-content"
              }`
            }
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Cài đặt</span>
          </NavLink>

          <Link
            to="/"
            onClick={() => setSidebarMode("chat")}
            className={`flex items-center justify-center gap-2 w-32 px-3 py-2 rounded-xl shadow-sm transition-all ${
              location.pathname === "/" && sidebarMode === "chat"
                ? "bg-primary text-primary-content"
                : "bg-base-200 hover:bg-base-300 text-base-content"
            }`}
          >
            <MessageSquare className="size-5" />
            <span className="hidden sm:inline">Tin nhắn</span>
          </Link>

          <Link
            to="/"
            onClick={() => setSidebarMode("friend")}
            className={`flex items-center justify-center gap-2 w-32 px-3 py-2 rounded-xl shadow-sm transition-all ${
              location.pathname === "/" && sidebarMode === "friend"
                ? "bg-primary text-primary-content"
                : "bg-base-200 hover:bg-base-300 text-base-content"
            }`}
          >
            <Users className="size-5" />
            <span className="hidden sm:inline">Bạn bè</span>
          </Link>

          {authUser && (
            <>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center justify-center gap-2 w-32 px-3 py-2 rounded-xl shadow-sm transition-all ${
                    isActive
                      ? "bg-primary text-primary-content"
                      : "bg-base-200 hover:bg-base-300 text-base-content"
                  }`
                }
              >
                <User className="size-5" />
                <span className="hidden sm:inline">Hồ sơ</span>
              </NavLink>

              <button
                onClick={logout}
                className="flex items-center justify-center gap-2 w-32 px-3 py-2 rounded-xl shadow-sm transition-all bg-base-200 hover:bg-base-300 text-base-content"
              >
                <LogOut className="size-5" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            </>
          )}
        </nav>

       <AnimatePresence>
  {menuOpen && (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 3 }}
        className="fixed inset-0 bg-black z-40 md:hidden"
      />

      {/* Menu chính */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className="fixed top-0 right-0 w-3/4 sm:w-2/5 h-full 
                   bg-base-100 z-50 shadow-2xl border-l border-base-300 
                   flex flex-col items-start py-8 px-6 space-y-4"
      >
        {/* Nút đóng */}
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-base-200"
        >
          <X size={24} />
        </button>

        {/* Các mục menu */}
        <NavLink
          to="/settings"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-3 text-lg font-medium w-full py-2 px-4 rounded-lg hover:bg-base-200"
        >
          <Settings className="size-5" /> Cài đặt
        </NavLink>

        <button
          onClick={() => {
            setSidebarMode("chat");
            setSelectedUser(null);
            setMenuOpen(false);
          }}
          className="flex items-center gap-3 text-lg font-medium w-full py-2 px-4 rounded-lg hover:bg-base-200"
        >
          <MessageSquare className="size-5" /> Tin nhắn
        </button>

        <button
          onClick={() => {
            setSidebarMode("friend");
            setSelectedUser(null);
            setMenuOpen(false);
          }}
          className="flex items-center gap-3 text-lg font-medium w-full py-2 px-4 rounded-lg hover:bg-base-200"
        >
          <Users className="size-5" /> Bạn bè
        </button>

        {authUser && (
          <>
            <NavLink
              to="/profile"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 text-lg font-medium w-full py-2 px-4 rounded-lg hover:bg-base-200"
            >
              <User className="size-5" /> Hồ sơ
            </NavLink>

            <button
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
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

      </div>
    </header>
  );
};

export default Navbar;
