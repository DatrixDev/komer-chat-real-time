const logo = "/logo.PNG";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50">
      <div className="max-w-md text-center space-y-6">
        {/* Logo hiển thị */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center 
              justify-center animate-bounce"
            >
              <img
                src={logo}
                alt="Komer Logo"
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-2xl font-bold">Chào mừng đến với K<span className="text-red-600">Ö</span>MER</h2>
        <p className="text-base-content/60">
          Xin chào! Kết nối và trò chuyện cùng Komer
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;
