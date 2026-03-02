"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const login = useAuthStore((state) => state.login);
    const isLoading = useAuthStore((state) => state.isLoading);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            await login(email, password);
            router.push("/chat");
        } catch (err: any) {
            setError(err.response?.data?.errors?.join(", ") || "Xác thực thất bại. Vui lòng kiểm tra lại thông tin.");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-academic-paper font-garamond text-academic-ink px-4 py-12">
            <div className="bg-[#FDFBF7] border border-academic-border shadow-md w-full max-w-md relative p-8 md:p-10">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-playfair font-black text-academic-accent mb-2">
                        Cổng Đăng nhập
                    </h2>
                    <p className="text-academic-neutral italic">
                        Tiếp tục lộ trình nghiên cứu của bạn.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="border-l-4 border-academic-warning bg-[#FDF2F2] p-4 text-academic-warning font-sans text-sm font-bold">
                            {error}
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
                        {isLoading ? "Đang xác thực..." : "Đăng nhập"}
                    </button>
                </form>

                <div className="mt-6 text-center border-t border-academic-border pt-4">
                    <Link
                        href="/register"
                        className="text-academic-neutral hover:text-academic-accent text-sm font-sans underline transition-colors"
                    >
                        Học viên mới? Điền đơn ghi danh.
                    </Link>
                </div>
            </div>
        </div>
    );
}
