"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Target, Flame, BrainCircuit, Activity, BookOpen, Clock } from "lucide-react";
import Link from "next/link";

export default function DashboardHomePage() {
    const { user, isInitialized } = useAuthStore();
    const router = useRouter();

    if (!isInitialized || !user) return null;

    const maxDailyQuestions = user.isPremium ? 999 : 10;
    const questionsUsed = user.dailyDeepQuestionsUsed || 0;
    const remaining = Math.max(0, maxDailyQuestions - questionsUsed);
    const progressPercent = Math.min((questionsUsed / maxDailyQuestions) * 100, 100);

    return (
        <div className="flex-1 overflow-y-auto bg-academic-paper pb-20 font-garamond text-academic-ink">
            {/* Header section with gradient */}
            <div className="bg-[#FDFBF7] border-b border-academic-border px-8 pt-10 pb-16 text-academic-ink relative">
                {/* Decorative textbook line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-academic-accent"></div>
                <div className="max-w-4xl mx-auto flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-black font-playfair mb-3 text-academic-accent">Xin chào, {user.fullName || "Học sinh"}</h1>
                        <p className="text-academic-neutral flex items-center gap-2 text-lg italic">
                            <span>Lớp {user.grade || "--"}</span> •
                            <span>Mục tiêu: {user.targetExams || "Chưa chọn"}</span>
                        </p>
                    </div>
                    <div className="flex bg-white border border-academic-border shadow-sm p-4 items-center gap-6 align-middle">
                        <div className="text-center border-r border-academic-border pr-6">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-academic-light">Chuỗi học</h3>
                            <div className="flex items-center gap-1 justify-center mt-1 text-academic-accent">
                                <Flame size={20} fill="currentColor" />
                                <span className="text-3xl font-playfair font-black">{user.streakDays || 0}</span>
                            </div>
                        </div>
                        <div className="text-center pl-2">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-academic-light">Hạng mục</h3>
                            <span className="text-lg font-bold font-playfair block mt-2 uppercase text-academic-ink">Tân binh</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-8 -mt-8 space-y-8">

                {/* AI Token/Usage Card */}
                <div className="bg-white shadow-sm border border-academic-border p-8 relative">
                    {/* Corner accent */}
                    <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                        <div className="absolute transform rotate-45 bg-academic-border/30 w-24 h-4 top-2 -right-6"></div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="border hover:bg-academic-paper transition border-academic-border p-3 text-academic-accent bg-[#FDFBF7]">
                                <BrainCircuit size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold font-playfair text-academic-ink">Trợ lý Cố vấn Học tập</h3>
                                <p className="text-lg text-academic-neutral italic">Phân tích chuyên sâu 4 bước (Bản chất, Khái niệm, Dẫn giải, Ghi chú)</p>
                            </div>
                        </div>
                        {user.isPremium && (
                            <span className="border border-academic-accent bg-academic-paper text-academic-accent text-xs font-bold px-3 py-1 uppercase tracking-widest">
                                Premium
                            </span>
                        )}
                    </div>

                    <div className="mb-3 flex justify-between text-base font-bold font-sans">
                        <span className="text-academic-neutral">Đã dùng: <span className="text-academic-ink">{questionsUsed}/{user.isPremium ? '∞' : maxDailyQuestions}</span></span>
                        <span className={`${remaining === 0 ? 'text-academic-warning' : 'text-academic-success'}`}>Hạn mức: {user.isPremium ? 'Không giới hạn' : remaining} lượt</span>
                    </div>

                    {!user.isPremium && (
                        <div className="w-full bg-academic-paper border border-academic-border h-3 overflow-hidden">
                            <div className={`h-full transition-all duration-500 ${remaining === 0 ? 'bg-academic-warning' : 'bg-academic-light'}`} style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    )}

                    <div className="mt-8">
                        <Link href="/chat" className="academic-button block text-center uppercase tracking-widest !py-4 font-sans text-sm">
                            Bắt đầu Phân tích Đề bài mới
                        </Link>
                    </div>
                </div>

                {/* Dashboard Grid Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Mock Knowledge Map */}
                    <div className="bg-white shadow-sm border border-academic-border p-8 flex flex-col justify-between hover:bg-[#FDFBF7] transition-colors group cursor-pointer relative">
                        <div className="absolute top-0 right-0 w-8 h-8 border-l border-b border-academic-border/30"></div>
                        <div>
                            <div className="border border-academic-border text-academic-accent w-12 h-12 flex items-center justify-center mb-6 bg-academic-paper group-hover:bg-academic-accent group-hover:text-white transition-colors">
                                <Target size={24} />
                            </div>
                            <h3 className="text-xl font-bold font-playfair text-academic-ink">Hệ thống Cây Kiến Thức</h3>
                            <p className="text-lg text-academic-neutral italic mt-2 mb-6 leading-relaxed">Theo dõi mức độ thông hiểu các chuyên đề trọng điểm.</p>
                            <div className="space-y-4 font-sans">
                                <div>
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2"><span className="text-academic-neutral">Giải Tích 12</span><span className="text-academic-accent">45%</span></div>
                                    <div className="w-full bg-academic-paper border border-academic-border h-2"><div className="bg-academic-light h-full" style={{ width: '45%' }}></div></div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2"><span className="text-academic-neutral">Hình Học Không Gian</span><span className="text-academic-accent">20%</span></div>
                                    <div className="w-full bg-academic-paper border border-academic-border h-2"><div className="bg-academic-light h-full" style={{ width: '20%' }}></div></div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 pt-4 border-t border-academic-border border-dashed font-bold font-sans uppercase text-xs tracking-widest text-academic-accent hover:text-academic-ink transition-colors">Vào Thư Quyển →</div>
                    </div>

                    {/* Quick Access */}
                    <div className="space-y-4">
                        <div className="bg-white border text-academic-ink border-academic-border p-6 flex items-center gap-5 hover:bg-[#FDFBF7] cursor-pointer shadow-sm group">
                            <div className="border border-academic-border bg-academic-paper text-academic-accent p-3 group-hover:bg-academic-accent group-hover:text-white transition-colors"><BookOpen size={24} /></div>
                            <div>
                                <h4 className="font-bold font-playfair text-xl">Sổ tay Lỗi sai</h4>
                                <p className="text-base text-academic-neutral italic line-clamp-1">Xem lại 12 ngộ nhận phổ biến.</p>
                            </div>
                        </div>
                        <div className="bg-white border text-academic-ink border-academic-border p-6 flex items-center gap-5 hover:bg-[#FDFBF7] cursor-pointer shadow-sm group">
                            <div className="border border-academic-border bg-academic-paper text-academic-accent p-3 group-hover:bg-academic-accent group-hover:text-white transition-colors"><Activity size={24} /></div>
                            <div>
                                <h4 className="font-bold font-playfair text-xl">Đề Cương ĐGNL</h4>
                                <p className="text-base text-academic-neutral italic line-clamp-1">Tự luận AI chấm điểm chi tiết.</p>
                            </div>
                        </div>
                        <div className="bg-white border text-academic-ink border-academic-border p-6 flex items-center gap-5 hover:bg-[#FDFBF7] cursor-pointer shadow-sm group">
                            <div className="border border-academic-border bg-academic-paper text-academic-accent p-3 group-hover:bg-academic-accent group-hover:text-white transition-colors"><Clock size={24} /></div>
                            <div>
                                <h4 className="font-bold font-playfair text-xl">Thư Viện Tra Cứu</h4>
                                <p className="text-base text-academic-neutral italic line-clamp-1">Xem lại các bài toán lịch sử.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
