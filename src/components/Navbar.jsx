import { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useSidebarStore } from "../store/useSidebarStore";
import { useChatStore } from "../store/useChatStore";
import MobileSidebar from "./MobileSidebar"; 

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
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-50 ">
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

        {/* 2. Gọi component sidebar mới tại đây */}
        <MobileSidebar
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
        />
      </div>
    </header>
  );
};

export default Navbar;