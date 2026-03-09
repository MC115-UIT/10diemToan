"use client";

import { useEffect, useState } from "react";
import { fetchNotebook } from "@/lib/chatApi";
import { parseDetailJson } from "@/hooks/useStreamJsonParser";
import { BookOpen, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ActionBar } from "@/components/ActionBar";

export default function NotebookPage() {
    const router = useRouter();
    const [entries, setEntries] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

    // Advanced filtering state
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
    const [selectedTopic, setSelectedTopic] = useState<string>("All");

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchNotebook();
                // Map the new ResponseJson field to a parsed object
                const enriched = data.map((item: any) => ({
                    ...item,
                    parsedDetail: item.responseJson ? parseDetailJson(item.responseJson) : null
                }));
                setEntries(enriched);
            } catch (err) {
                console.error("Failed to fetch notebook", err);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    // Derive unique topics and difficulties from data for filters
    const topics = ["All", ...Array.from(new Set(entries.map(e => e.topic).filter(Boolean)))];

    // Filter the items based on topic and difficulty
    const filteredEntries = entries.filter(e => {
        const difficulty = e.parsedDetail?.nature_analysis?.difficulty_level?.level?.toString() || "Unknown";
        const topicMatch = selectedTopic === "All" || e.topic === selectedTopic;
        const diffMatch = selectedDifficulty === "All" || difficulty === selectedDifficulty;
        return topicMatch && diffMatch;
    });

    const difficultyStars = (level: number) => {
        if (!level || level < 1 || level > 5) return <span className="text-academic-border">Chưa phân loại</span>;
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < level ? "text-academic-accent" : "text-academic-border"}>★</span>
        ));
    };

    return (
        <div className="flex-1 overflow-y-auto bg-academic-paper pb-20 font-garamond text-academic-ink">
            {/* Header section with gradient */}
            <div className="bg-[#FDFBF7] border-b border-academic-border px-8 pt-10 pb-8 text-academic-ink relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-academic-accent"></div>
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <Link href="/home" className="text-sm font-bold uppercase tracking-widest text-academic-light hover:text-academic-accent mb-4 inline-block">
                            ← Quay lại Trang Chủ
                        </Link>
                        <h1 className="text-4xl font-black font-playfair mb-3 flex items-center gap-3">
                            <BookOpen size={36} className="text-academic-accent" />
                            Sổ tay Lỗi sai
                        </h1>
                        <p className="text-academic-neutral italic text-lg">
                            Lưu trữ các bài toán đáng chú ý và những ngộ nhận cần tránh.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-8 mt-8">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-academic-neutral">
                        <Loader2 className="animate-spin mb-4 text-academic-accent" size={40} />
                        <p className="italic">Đang tải sổ tay...</p>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="bg-white border border-academic-border p-12 text-center shadow-sm">
                        <BookOpen size={48} className="mx-auto mb-4 text-academic-light" />
                        <h3 className="font-playfair text-xl font-bold mb-2">Sổ tay trống</h3>
                        <p className="text-academic-neutral italic mb-6">Bạn chưa lưu bài toán nào vào Sổ tay.</p>
                        <Link href="/chat" className="academic-button inline-block">
                            Đi đến phòng tập luyện
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Filters Column */}
                        <div className="w-full md:w-64 shrink-0 space-y-6">
                            <div className="bg-white border border-academic-border p-5 shadow-sm">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-academic-light mb-4">Lọc theo Chủ đề</h3>
                                <div className="space-y-2">
                                    {topics.map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setSelectedTopic(t)}
                                            className={`block w-full text-left px-3 py-2 text-sm transition-colors ${selectedTopic === t ? 'bg-academic-paper border-l-2 border-academic-accent font-bold text-academic-accent' : 'text-academic-ink hover:bg-[#FDFBF7]'}`}
                                        >
                                            {t === "All" ? "Tất cả chủ đề" : t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white border border-academic-border p-5 shadow-sm">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-academic-light mb-4">Lọc theo Độ khó</h3>
                                <div className="space-y-2">
                                    {["All", "1", "2", "3", "4", "5"].map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setSelectedDifficulty(level)}
                                            className={`block w-full text-left px-3 py-2 text-sm transition-colors ${selectedDifficulty === level ? 'bg-academic-paper border-l-2 border-academic-accent font-bold text-academic-accent' : 'text-academic-ink hover:bg-[#FDFBF7]'}`}
                                        >
                                            {level === "All" ? "Mọi cấp độ" : `Cấp độ ${level}`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* List Column */}
                        <div className="flex-1 space-y-6">
                            {filteredEntries.length === 0 ? (
                                <div className="text-center py-10 bg-white border border-academic-border italic text-academic-neutral p-6">
                                    Không tìm thấy bài giảng nào phù hợp với bộ lọc.
                                </div>
                            ) : (
                                filteredEntries.map((entry) => {
                                    const isExpanded = selectedEntryId === entry.id;
                                    const parsed = entry.parsedDetail;
                                    const rawDifficulty = parsed?.nature_analysis?.difficulty_level?.level;

                                    return (
                                        <div key={entry.id} className="bg-white border border-academic-border shadow-sm transition-all duration-300">
                                            {/* Header summary line */}
                                            <div
                                                className={`p-5 cursor-pointer hover:bg-[#FDFBF7] transition-colors ${isExpanded ? 'bg-[#FDFBF7]' : ''}`}
                                                onClick={() => setSelectedEntryId(isExpanded ? null : entry.id)}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-academic-accent block border border-academic-accent/30 px-2 py-0.5 bg-academic-paper inline-block">
                                                        {entry.topic || "Chưa phân loại"}
                                                    </span>
                                                    <span className="text-xs text-academic-light uppercase tracking-widest font-sans">
                                                        {new Date(entry.createdAt).toLocaleDateString("vi-VN")}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-playfair font-bold text-academic-ink mb-1 line-clamp-2 leading-snug">
                                                    {entry.question || "Bản thu phương trình ảnh"}
                                                </h3>

                                                <div className="flex items-center gap-4 mt-3">
                                                    <div className="flex gap-0.5 text-sm">{difficultyStars(rawDifficulty)}</div>
                                                    {entry.userNote && (
                                                        <div className="flex items-center gap-1 text-academic-neutral text-sm italic">
                                                            <BookOpen size={14} /> Có ghi chú
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Expandable Detail View */}
                                            {isExpanded && (
                                                <div className="border-t border-academic-border p-6 bg-white animate-slide-up origin-top">

                                                    {entry.userNote && (
                                                        <div className="bg-[#FAF8F5] p-4 mb-6 border-l-4 border-academic-accent">
                                                            <p className="text-xs uppercase font-bold tracking-widest text-academic-light mb-1 border-b border-[#E0DACE] pb-1">Ghi chú của bạn</p>
                                                            <p className="text-academic-ink italic">{entry.userNote}</p>
                                                        </div>
                                                    )}

                                                    {parsed ? (
                                                        <div className="space-y-6">
                                                            {/* Interpretation Summary */}
                                                            {parsed.interpretation?.problem_summary && (
                                                                <div>
                                                                    <p className="text-xs uppercase font-bold tracking-widest text-academic-light mb-1">Nhận diện</p>
                                                                    <p className="text-academic-ink bg-academic-paper p-4 border border-academic-border">{parsed.interpretation.problem_summary}</p>
                                                                </div>
                                                            )}

                                                            {/* Misunderstandings Traps */}
                                                            {parsed.concept_foundation?.some((c: any) => c.common_misunderstanding) && (
                                                                <div className="bg-[#FDF2F2] border border-academic-warning p-4">
                                                                    <p className="text-xs uppercase font-bold tracking-widest text-academic-warning mb-2 flex items-center gap-1">
                                                                        <AlertCircle size={14} /> Lỗi ngộ nhận
                                                                    </p>
                                                                    <ul className="list-disc pl-5 space-y-1">
                                                                        {parsed.concept_foundation.map((c: any, i: number) => c.common_misunderstanding ? (
                                                                            <li key={i} className="text-sm text-academic-ink">{c.common_misunderstanding}</li>
                                                                        ) : null)}
                                                                    </ul>
                                                                </div>
                                                            )}

                                                            {/* Detail link / Actions */}
                                                            <div className="pt-4 border-t border-academic-border mt-6">
                                                                <ActionBar
                                                                    requestId={entry.mathRequestId}
                                                                    variants={parsed.variants || []}
                                                                    finalAnswer={parsed.final_answer || ""}
                                                                    mainTopic={parsed.nature_analysis?.main_topic || entry.topic}
                                                                    question={entry.question}
                                                                    solutionSteps={parsed.solution_steps || []}
                                                                    isSaved={true}
                                                                    onPracticeNow={(problem) => router.push(`/chat/new?q=${encodeURIComponent(problem)}`)}
                                                                />
                                                            </div>

                                                            <div className="mt-4 text-center">
                                                                <Link href={`/chat/${entry.mathRequestId}?ref=notebook`} className="text-xs font-bold uppercase tracking-widest text-academic-accent hover:underline">
                                                                    Xem lại toàn bộ phiên giải →
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-academic-neutral italic">Ghi chép này không có cấu trúc phân tích sâu do là lịch sử hệ thống cũ.</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
