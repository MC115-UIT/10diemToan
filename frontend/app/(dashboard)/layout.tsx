"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, MessageSquare, PlusCircle, Activity } from "lucide-react";
import { fetchConversations } from "@/lib/chatApi";
import { Conversation } from "@/types";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isInitialized, fetchAuthCheck, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [conversations, setConversations] = useState<Conversation[]>([]);

    useEffect(() => {
        if (!isInitialized) {
            fetchAuthCheck();
        }
    }, [isInitialized, fetchAuthCheck]);

    useEffect(() => {
        if (isInitialized && !user) {
            router.push("/login");
        } else if (isInitialized && user && !user.isOnboarded && !pathname.includes('/onboarding')) {
            router.push("/onboarding");
        } else if (isInitialized && user && pathname === '/') {
            router.push("/home"); // Redirect root to dashboard
        }
    }, [isInitialized, user, router, pathname]);

    useEffect(() => {
        if (user) {
            fetchConversations().then(setConversations).catch(console.error);
        }
    }, [user, pathname]); // re-fetch when path changes (e.g. new chat created)

    if (!isInitialized || !user) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    return (
        <div className="flex h-screen bg-academic-paper font-garamond text-academic-ink">
            {/* Sidebar */}
            <aside className="w-64 border-r border-academic-border bg-[#FDFBF7] flex flex-col shadow-sm">
                <div className="p-4 border-b border-academic-border space-y-3">
                    <Link
                        href="/home"
                        className={`flex items-center gap-3 w-full rounded-sm px-4 py-3 text-lg font-bold transition-colors ${pathname === '/home' ? 'bg-[#F2EFE9] text-academic-accent border-l-4 border-academic-accent' : 'text-academic-neutral hover:bg-[#F2EFE9] hover:text-academic-ink border-l-4 border-transparent'}`}
                    >
                        <Activity size={20} />
                        Bảng Tin Lộ Trình
                    </Link>
                    <Link
                        href="/chat"
                        className="flex items-center justify-center gap-2 w-full academic-button !py-3 !text-base"
                    >
                        <PlusCircle size={18} />
                        Tạo Bài Phân Tích Mới
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    <div className="text-sm font-bold text-academic-light px-2 pt-4 pb-2 uppercase tracking-widest font-sans">
                        Lịch sử Tra Cứu
                    </div>
                    {conversations.map((conv) => (
                        <Link
                            key={conv.id}
                            href={`/chat/${conv.id}`}
                            className={`flex items-center gap-3 rounded-sm px-3 py-2 text-base transition-colors ${pathname.includes(conv.id)
                                ? 'bg-[#F2EFE9] text-academic-accent font-bold border-l-2 border-academic-accent'
                                : 'text-academic-neutral hover:bg-[#F2EFE9] border-l-2 border-transparent hover:text-academic-ink'
                                }`}
                        >
                            <MessageSquare size={18} className="opacity-70" />
                            <span className="truncate">{conv.title || "Giải Thuật Toán Học"}</span>
                        </Link>
                    ))}
                    {conversations.length === 0 && (
                        <div className="text-base text-academic-neutral/60 px-2 flex justify-center py-4 italic">Chưa có dữ liệu tra cứu</div>
                    )}
                </div>

                <div className="p-4 border-t border-academic-border bg-academic-paper">
                    <div className="flex items-center justify-between">
                        <div className="truncate text-base font-bold text-academic-ink font-sans">
                            {user.email}
                        </div>
                        <button
                            onClick={() => logout()}
                            className="p-2 text-academic-neutral hover:text-academic-warning hover:bg-[#FDF2F2] rounded-sm transition-colors"
                            title="Đăng xuất"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-academic-paper">
                {children}
            </main>
        </div>
    );
}
