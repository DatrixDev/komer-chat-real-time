import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { Send } from "lucide-react";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Chào bạn! Mọi việc vẫn ổn chứ?", isSent: false },
  { id: 2, content: "Tất nhiên rồi! Mình đang hoàn thiện vài tính năng mới.", isSent: true },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-base-200 pt-24 pb-16 flex justify-center px-4">
      <div className="w-full max-w-5xl bg-base-100 rounded-2xl shadow-lg p-6 sm:p-8">
        {/* --- Tiêu đề --- */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-zinc-800">Cài đặt giao diện</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Chọn chủ đề và xem trước giao diện trò chuyện của bạn
          </p>
        </div>

        <div className="space-y-5">
          <h2 className="text-lg font-semibold">Chủ đề</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-3">
            {THEMES.map((t) => (
              <button
                key={t}
                className={`group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all border ${
                  theme === t
                    ? "bg-blue-100 border-blue-500"
                    : "hover:bg-base-200 border-transparent"
                }`}
                onClick={() => setTheme(t)}
              >
                <div className="relative h-8 w-full rounded-md overflow-hidden" data-theme={t}>
                  <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                    <div className="rounded bg-primary"></div>
                    <div className="rounded bg-secondary"></div>
                    <div className="rounded bg-accent"></div>
                    <div className="rounded bg-neutral"></div>
                  </div>
                </div>
                <span className="text-[11px] font-medium truncate w-full text-center">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-4">Xem trước</h3>
          <div className="rounded-2xl border border-base-300 overflow-hidden bg-base-100 shadow-md">
            <div className="p-4 bg-base-200">
              <div className="max-w-lg mx-auto">
                <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
                  {/* Header Chat */}
                  <div className="px-4 py-3 border-b border-base-300 bg-base-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content font-medium">
                        D
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">Đạt cute</h3>
                        <p className="text-xs text-base-content/70">Đang hoạt động</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-4 min-h-[200px] max-h-[200px] overflow-y-auto bg-base-100">
                    {PREVIEW_MESSAGES.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl p-3 shadow-sm text-sm ${
                            message.isSent
                              ? "bg-primary text-primary-content"
                              : "bg-base-200 text-base-content"
                          }`}
                        >
                          <p>{message.content}</p>
                          <p
                            className={`text-[10px] mt-1.5 ${
                              message.isSent
                                ? "text-primary-content/70"
                                : "text-base-content/70"
                            }`}
                          >
                            12:00
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-base-300 bg-base-100">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="input input-bordered flex-1 text-sm h-10"
                        placeholder="Nhập tin nhắn..."
                        value="Đây là phần xem trước"
                        readOnly
                      />
                      <button className="btn btn-primary h-10 min-h-0">
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
