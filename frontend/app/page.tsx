"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { BookOpen, GraduationCap, Network, PenTool, AlertTriangle } from "lucide-react";

export default function LandingPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Auth States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");

  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const router = useRouter();

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegisterMode) {
        await register(email, password, fullName);
        // After register, you might want to auto-login or redirect. Assuming auto-login for now or asking to login.
        // Assuming register doesn't auto-set tokens, let's login right after.
        await login(email, password);
        router.push("/onboarding");
      } else {
        await login(email, password);
        router.push("/chat");
      }
      setIsLoginModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.errors?.join(", ") || "Xác thực thất bại. Vui lòng kiểm tra lại thông tin.");
    }
  };

  return (
    <div className="min-h-screen bg-academic-paper font-garamond text-academic-ink selection:bg-academic-accent selection:text-white">

      {/* Top Navigation Bar */}
      <nav className="border-b border-academic-border bg-[#FDFBF7] sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 text-academic-accent">
            <GraduationCap size={28} />
            <span className="font-playfair font-black text-2xl tracking-wide">Toán Sâu</span>
          </div>
          <div className="hidden md:flex gap-8 text-academic-neutral font-bold tracking-widest text-sm uppercase">
            <a href="#gioi-thieu" className="hover:text-academic-accent transition-colors">Giới thiệu</a>
            <a href="#tinh-nang" className="hover:text-academic-accent transition-colors">Tính năng</a>
            <a href="#phuong-phap" className="hover:text-academic-accent transition-colors">Phương pháp</a>
          </div>
          <div>
            <button
              onClick={() => { setIsRegisterMode(false); setIsLoginModalOpen(true); }}
              className="academic-button !px-6 !py-2 !text-sm uppercase tracking-widest font-sans font-bold"
            >
              Đăng nhập
            </button>
          </div>
        </div>
        <div className="w-full h-[2px] bg-academic-accent"></div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl md:text-6xl font-black font-playfair text-academic-accent mb-8 leading-tight">
          Giải phẫu Bài toán.<br />Hiểu sâu Bản chất.
        </h1>
        <p className="text-xl md:text-2xl text-academic-neutral mb-12 max-w-2xl mx-auto leading-relaxed italic">
          Một nền tảng học thuật nghiêm túc, loại bỏ sự xao nhãng. Toán Sâu sử dụng Trí tuệ Nhân tạo để bóc tách từng lớp của một bài toán như một cuốn giáo trình kinh điển.
        </p>
        <div className="flex gap-6 justify-center">
          <button
            onClick={() => { setIsRegisterMode(true); setIsLoginModalOpen(true); }}
            className="bg-academic-accent text-white font-playfair text-xl italic px-10 py-4 border-2 border-academic-accent hover:bg-academic-paper hover:text-academic-accent transition-all duration-300"
          >
            Bắt đầu Hành trình Học thuật
          </button>
        </div>
      </header>

      {/* Feature Highlights (Academic Style) */}
      <section id="tinh-nang" className="border-t border-academic-border bg-white py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-playfair font-bold text-academic-accent uppercase tracking-widest">Tiến trình Phân tích 4 Phân Lớp</h2>
            <div className="w-24 h-1 bg-academic-accent mx-auto mt-6"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Box 1 */}
            <div className="border border-academic-border p-8 bg-[#FDFBF7] relative group hover:bg-academic-paper transition-colors duration-500">
              <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-academic-accent mt-4 mr-4 opacity-20"></div>
              <BookOpen className="text-academic-accent mb-6" size={36} />
              <h3 className="text-2xl font-playfair font-bold text-academic-ink mb-3">I. Nhận diện & Bản chất</h3>
              <p className="text-lg text-academic-neutral leading-relaxed">Hệ thống tóm tắt đề bài, xác định chuyên đề cốt lõi và cung cấp góc nhìn tổng quan trước khi đi vào tính toán chi tiết.</p>
            </div>

            {/* Box 2 */}
            <div className="border border-academic-border p-8 bg-[#FDFBF7] relative group hover:bg-academic-paper transition-colors duration-500">
              <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-academic-accent mt-4 mr-4 opacity-20"></div>
              <Network className="text-academic-accent mb-6" size={36} />
              <h3 className="text-2xl font-playfair font-bold text-academic-ink mb-3">II. Nền tảng Lý thuyết</h3>
              <p className="text-lg text-academic-neutral leading-relaxed">Trích lục các định lý, công thức và tiền đề bắt buộc phải ghi nhớ để có thể phá vỡ cấu trúc của bài toán hiện tại.</p>
            </div>

            {/* Box 3 */}
            <div className="border border-academic-border p-8 bg-[#FDFBF7] relative group hover:bg-academic-paper transition-colors duration-500">
              <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-academic-accent mt-4 mr-4 opacity-20"></div>
              <PenTool className="text-academic-accent mb-6" size={36} />
              <h3 className="text-2xl font-playfair font-bold text-academic-ink mb-3">III. Dẫn giải Chi tiết</h3>
              <p className="text-lg text-academic-neutral leading-relaxed">Trình bày lời giải từng bước một (Step-by-step). Không nhảy bước, đảm bảo tính vẹn toàn và logic toán học khắt khe.</p>
            </div>

            {/* Box 4 */}
            <div className="border border-academic-border border-l-4 border-l-academic-warning p-8 bg-[#FDFBF7] relative group hover:bg-[#FDF2F2] transition-colors duration-500">
              <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-academic-warning mt-4 mr-4 opacity-20"></div>
              <AlertTriangle className="text-academic-warning mb-6" size={36} />
              <h3 className="text-2xl font-playfair font-bold text-academic-warning mb-3">IV. Bẫy Khái niệm & Rút kinh nghiệm</h3>
              <p className="text-lg text-academic-neutral leading-relaxed">Phân tích sai lầm phổ biến mà học sinh thường mắc phải. Hệ thống hóa lại điểm mấu chốt để ghi vào sổ tay.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-academic-ink text-academic-paper py-12 text-center border-t-4 border-academic-accent">
        <GraduationCap size={40} className="mx-auto mb-4 opacity-50" />
        <p className="font-playfair text-xl italic opacity-80 mb-2">"Toán học là bảng chữ cái mà Thượng Đế đã dùng để viết nên vũ trụ."</p>
        <p className="text-sm tracking-widest uppercase opacity-50 font-sans mt-8">© 2025 Toán Sâu - Nền tảng Giáo dục Độc lập</p>
      </footer>

      {/* Login / Register Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-academic-ink/80 backdrop-blur-sm p-4">
          <div className="bg-academic-paper border border-academic-border shadow-2xl w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200">

            {/* Close Button */}
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 text-academic-neutral hover:text-academic-accent text-xl font-sans"
            >
              ✕
            </button>

            <div className="p-8 md:p-10">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-playfair font-black text-academic-accent mb-2">
                  {isRegisterMode ? "Ghi danh Học viên" : "Cổng Đăng nhập"}
                </h2>
                <p className="text-academic-neutral italic">
                  {isRegisterMode ? "Thiết lập hồ sơ học thuật của bạn." : "Tiếp tục lộ trình nghiên cứu của bạn."}
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-5">
                {error && (
                  <div className="border-l-4 border-academic-warning bg-[#FDF2F2] p-4 text-academic-warning font-sans text-sm font-bold">
                    {error}
                  </div>
                )}

                {isRegisterMode && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-academic-light mb-1">Họ và Tên</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white border border-academic-border px-4 py-3 text-academic-ink focus:outline-none focus:border-academic-accent focus:ring-1 focus:ring-academic-accent transition-shadow font-sans"
                      placeholder="VD: Nguyễn Văn A"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-academic-light mb-1">Thư điện tử (Email)</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-academic-border px-4 py-3 text-academic-ink focus:outline-none focus:border-academic-accent focus:ring-1 focus:ring-academic-accent transition-shadow font-sans"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-academic-light mb-1">Mật khẩu</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-academic-border px-4 py-3 text-academic-ink focus:outline-none focus:border-academic-accent focus:ring-1 focus:ring-academic-accent transition-shadow font-sans"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full academic-button !mt-8 disabled:opacity-50 flex justify-center uppercase font-sans tracking-widest text-sm font-bold"
                >
                  {isLoading ? "Đang xác thực..." : (isRegisterMode ? "Ghi danh" : "Đăng nhập")}
                </button>
              </form>

              <div className="mt-6 text-center border-t border-academic-border pt-4">
                <button
                  type="button"
                  onClick={() => { setIsRegisterMode(!isRegisterMode); setError(""); }}
                  className="text-academic-neutral hover:text-academic-accent text-sm font-sans underline transition-colors"
                >
                  {isRegisterMode ? "Đã có quyền truy cập? Đăng nhập tại đây." : "Học viên mới? Điền đơn ghi danh."}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
