"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { UserService } from "@/services/UserService";

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [grade, setGrade] = useState<number | "">("");
    const [targetExams, setTargetExams] = useState<string[]>([]);
    const [level, setLevel] = useState<number | "">("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const fetchAuthCheck = useAuthStore(state => state.fetchAuthCheck);

    const grades = [10, 11, 12];
    const mathExams = ["THPTQG", "ĐGNL (HCM)", "ĐGNL (HN)", "ĐGTD (Bách Khoa)"];

    const handleExamToggle = (exam: string) => {
        setTargetExams(prev =>
            prev.includes(exam) ? prev.filter(e => e !== exam) : [...prev, exam]
        );
    };

    const handleNext = () => setStep(prev => Math.min(prev + 1, 3));
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async () => {
        if (!grade || targetExams.length === 0 || !level) return;
        setIsSubmitting(true);
        try {
            await UserService.onboardUser({
                grade: Number(grade),
                targetExams: targetExams.join(", "),
                selfAssessmentLevel: Number(level)
            });
            // Re-fetch user profile to update `isOnboarded` true
            await fetchAuthCheck();
            router.push("/chat");
        } catch (err) {
            console.error(err);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50 flex-col">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

                {/* Progress Indicators */}
                <div className="flex gap-2 mb-8 justify-center">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`h-2.5 w-16 rounded-full transition-colors ${step >= i ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    ))}
                </div>

                <div className="min-h-[300px] flex flex-col justify-center">
                    {step === 1 && (
                        <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-2xl font-bold text-gray-900">Bạn đang học lớp mấy?</h2>
                            <p className="text-gray-500 text-sm">Giúp hệ thống gợi ý chủ đề phù hợp với chương trình của bạn.</p>

                            <div className="flex gap-4 justify-center mt-6">
                                {grades.map(g => (
                                    <button
                                        key={g}
                                        onClick={() => { setGrade(g); handleNext(); }}
                                        className={`w-20 h-20 text-xl font-bold rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 ${grade === g ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-2xl font-bold text-gray-900">Mục tiêu kỳ thi của bạn?</h2>
                            <p className="text-gray-500 text-sm">Chọn một hoặc nhiều kỳ thi bạn dự định tham gia.</p>

                            <div className="grid grid-cols-2 gap-3 mt-6">
                                {mathExams.map(exam => (
                                    <button
                                        key={exam}
                                        onClick={() => handleExamToggle(exam)}
                                        className={`p-4 text-sm font-semibold rounded-xl border-2 text-left flex justify-between items-center transition-colors ${targetExams.includes(exam) ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-gray-200 text-gray-700 hover:border-blue-200'}`}
                                    >
                                        {exam}
                                        {targetExams.includes(exam) && <span className="text-blue-600">✓</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-2xl font-bold text-gray-900">Bạn tự đánh giá năng lực Toán hiện tại?</h2>
                            <p className="text-gray-500 text-sm">Để AI hướng dẫn đúng trọng tâm và gợi ý bài tập chuẩn.</p>

                            <div className="space-y-3 mt-6 text-left">
                                {[
                                    { value: 1, label: "Mất gốc / Yếu", desc: "Cần lấy lại nền tảng cơ bản" },
                                    { value: 2, label: "Trung bình", desc: "Nắm được cơ bản, hay sai vặt" },
                                    { value: 3, label: "Khá", desc: "Mục tiêu 7-8 điểm" },
                                    { value: 4, label: "Giỏi", desc: "Chinh phục 9+ và ĐGNL" }
                                ].map(lvl => (
                                    <button
                                        key={lvl.value}
                                        onClick={() => setLevel(lvl.value)}
                                        className={`w-full p-4 rounded-xl border-2 flex flex-col transition-colors ${level === lvl.value ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}
                                    >
                                        <span className={`font-bold ${level === lvl.value ? 'text-blue-800' : 'text-gray-900'}`}>{lvl.label}</span>
                                        <span className={level === lvl.value ? 'text-blue-600 text-xs' : 'text-gray-500 text-xs'}>{lvl.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="mt-8 flex justify-between border-t border-gray-100 pt-6">
                    <button
                        onClick={handleBack}
                        className={`text-gray-500 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 ${step === 1 ? 'invisible' : ''}`}
                    >
                        Quay lại
                    </button>

                    {step < 3 ? (
                        <button
                            onClick={handleNext}
                            disabled={step === 1 ? !grade : targetExams.length === 0}
                            className="bg-gray-900 text-white font-semibold px-8 py-2.5 rounded-xl hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-gray-900 transition-colors"
                        >
                            Tiếp tục
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!level || isSubmitting}
                            className="bg-blue-600 text-white font-semibold flex items-center gap-2 px-8 py-2.5 rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-colors"
                        >
                            {isSubmitting ? 'Đang chuẩn bị...' : 'Bắt đầu học ngay'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
