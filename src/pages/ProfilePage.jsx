import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-base-200 flex justify-center px-4">
      <div className="w-full max-w-lg bg-base-100 rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-800">Hồ sơ cá nhân</h1>
          <p className="text-zinc-500 mt-1">Thông tin tài khoản của bạn</p>
        </div>

        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="relative">
            <img
              src={selectedImg || authUser.profilePic || "/avatar.png"}
              alt="Ảnh đại diện"
              className="w-32 h-32 rounded-full object-cover border-4 border-base-300 shadow-md"
            />
            <label
              htmlFor="avatar-upload"
              className={`absolute bottom-0 right-0 bg-base-content p-2 rounded-full cursor-pointer hover:scale-105 transition-transform ${
                isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
              }`}
            >
              <Camera className="w-5 h-5 text-base-200" />
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUpdatingProfile}
              />
            </label>
          </div>
          <p className="text-sm text-zinc-500">
            {isUpdatingProfile
              ? "Đang tải ảnh lên..."
              : "Bấm vào biểu tượng máy ảnh để thay ảnh đại diện"}
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm text-zinc-500 flex items-center gap-2 mb-1">
              <User className="w-4 h-4" /> Họ và tên
            </label>
            <p className="px-4 py-2.5 bg-base-200 rounded-lg border text-zinc-800 font-medium">
              {authUser?.fullName}
            </p>
          </div>

          <div>
            <label className="text-sm text-zinc-500 flex items-center gap-2 mb-1">
              <Mail className="w-4 h-4" /> Địa chỉ Email
            </label>
            <p className="px-4 py-2.5 bg-base-200 rounded-lg border text-zinc-800 font-medium truncate">
              {authUser?.email}
            </p>
          </div>
        </div>

        {/* Thông tin tài khoản */}
        <div className="mt-10 bg-base-200 rounded-xl p-5 border border-base-300">
          <h2 className="text-lg font-semibold mb-4 text-zinc-800">
            Thông tin tài khoản
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-base-300">
              <span>Ngày tham gia</span>
              <span className="font-medium text-zinc-700">
                {authUser.createdAt?.split("T")[0]}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>Trạng thái tài khoản</span>
              <span className="text-green-600 font-medium">Đang hoạt động</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
