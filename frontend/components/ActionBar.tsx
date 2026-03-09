"use client";

import { useState } from "react";
import { Shuffle, RotateCcw, BookMarked, Pencil, Heart } from "lucide-react";

export interface ActionBarProps {
    requestId: string;
    variants: any[];
    finalAnswer: string;
    mainTopic: string;
    question: string;
    solutionSteps: any[];
    isMastered?: boolean;
    isSaved?: boolean;
    onPracticeNow: (variantProblem: string) => void;
    onToggleMastered?: (requestId: string) => void;
    onSaveToNotebook?: (requestId: string, topic: string, note: string) => void;
}

export function ActionBar({
    requestId,
    variants,
    finalAnswer,
    mainTopic,
    question,
    solutionSteps,
    isMastered = false,
    isSaved = false,
    onPracticeNow,
    onToggleMastered,
    onSaveToNotebook,
}: ActionBarProps) {
    const [showVariantSheet, setShowVariantSheet] = useState(false);
    const [showReverseModal, setShowReverseModal] = useState(false);
    const [showNotebookPopover, setShowNotebookPopover] = useState(false);
    const [notebookNote, setNotebookNote] = useState("");
    const [masteredState, setMasteredState] = useState(isMastered);
    const [savedState, setSavedState] = useState(isSaved);

    const handleToggleMastered = () => {
        setMasteredState(!masteredState);
        onToggleMastered?.(requestId);
    };

    const handleSaveNote = () => {
        setSavedState(true);
        onSaveToNotebook?.(requestId, mainTopic, notebookNote);
        setShowNotebookPopover(false);
        setNotebookNote("");
    };

    return (
        <div className="relative">
            {/* ── Notebook popover ── */}
            {showNotebookPopover && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 bg-white border border-academic-border shadow-xl p-5 z-30">
                    <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 border-r border-b border-academic-border bg-white rotate-45" />
                    <h4 className="font-bold font-playfair text-academic-accent text-lg mb-0.5">Lưu vào Sổ tay</h4>
                    <p className="text-xs text-academic-light mb-3 uppercase tracking-widest">
                        {mainTopic || "Chưa phân loại"}
                    </p>
                    <textarea
                        value={notebookNote}
                        onChange={(e) => setNotebookNote(e.target.value)}
                        placeholder="Ghi chú của bạn (tùy chọn)..."
                        className="w-full border border-academic-border p-3 text-sm resize-none min-h-[72px] focus:outline-none focus:border-academic-accent"
                    />
                    <div className="flex gap-2 mt-3">
                        <button onClick={handleSaveNote} className="academic-button flex-1 !py-2 text-xs">
                            Lưu ngay
                        </button>
                        <button
                            onClick={() => setShowNotebookPopover(false)}
                            className="flex-1 border border-academic-border text-academic-neutral py-2 text-xs hover:bg-academic-paper transition-colors"
                        >
                            Huỷ
                        </button>
                    </div>
                </div>
            )}

            {/* ── Action Bar: 5-column full-width toolbar ── */}
            <div className="grid grid-cols-5 border-t border-academic-border divide-x divide-academic-border bg-[#FDFBF7]">

                {/* 1. Tạo biến thể */}
                <ActionBtn
                    icon={<Shuffle size={20} />}
                    label="Tạo biến thể"
                    onClick={() => setShowVariantSheet(true)}
                    sublabel={variants?.length ? `${variants.length} dạng` : undefined}
                />

                {/* 2. Thử dạng ngược */}
                <ActionBtn
                    icon={<RotateCcw size={20} />}
                    label="Thử dạng ngược"
                    onClick={() => setShowReverseModal(true)}
                />

                {/* 3. Lưu Sổ tay */}
                <ActionBtn
                    icon={<BookMarked size={20} />}
                    label={savedState ? "Đã lưu" : "Lưu Sổ tay"}
                    onClick={() => !savedState && setShowNotebookPopover(!showNotebookPopover)}
                    isActive={savedState}
                    activeColor="text-emerald-600 bg-emerald-50"
                    activeIcon={<BookMarked size={20} fill="currentColor" />}
                />

                {/* 4. Thực hành ngay */}
                <ActionBtn
                    icon={<Pencil size={20} />}
                    label="Thực hành"
                    onClick={() => {
                        const first = variants?.[0];
                        if (first?.new_problem) onPracticeNow(first.new_problem);
                    }}
                    disabled={!variants?.length}
                />

                {/* 5. Đánh dấu đã nắm */}
                <ActionBtn
                    icon={<Heart size={20} fill={masteredState ? "currentColor" : "none"} />}
                    label={masteredState ? "Đã nắm!" : "Đánh dấu"}
                    onClick={handleToggleMastered}
                    isActive={masteredState}
                    activeColor="text-orange-500 bg-orange-50"
                />
            </div>

            {/* ── Variant Sheet ── */}
            {showVariantSheet && (
                <VariantSheet
                    variants={variants}
                    onClose={() => setShowVariantSheet(false)}
                    onTryVariant={(problem) => { setShowVariantSheet(false); onPracticeNow(problem); }}
                />
            )}

            {/* ── Reverse Modal ── */}
            {showReverseModal && (
                <ReverseProblemModal
                    finalAnswer={finalAnswer}
                    solutionSteps={solutionSteps}
                    originalQuestion={question}
                    onClose={() => setShowReverseModal(false)}
                />
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────
// Shared sub-component: individual action button cell
// ─────────────────────────────────────────────────────
interface ActionBtnProps {
    icon: React.ReactNode;
    activeIcon?: React.ReactNode;
    label: string;
    sublabel?: string;
    onClick: () => void;
    isActive?: boolean;
    activeColor?: string;
    disabled?: boolean;
}

function ActionBtn({ icon, activeIcon, label, sublabel, onClick, isActive, activeColor = "text-academic-accent bg-academic-paper", disabled }: ActionBtnProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                flex flex-col items-center justify-center gap-1.5 py-3 px-2 w-full
                text-center transition-all duration-150 group
                ${isActive
                    ? activeColor
                    : "text-academic-neutral hover:text-academic-accent hover:bg-academic-paper"
                }
                ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
            `}
        >
            <span className={`transition-transform duration-150 ${!disabled && "group-hover:scale-110"}`}>
                {isActive && activeIcon ? activeIcon : icon}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider leading-tight">
                {label}
            </span>
            {sublabel && (
                <span className="text-[9px] font-normal text-academic-light normal-case tracking-normal">
                    {sublabel}
                </span>
            )}
        </button>
    );
}

// ────────────────────────────────────────────────────
// Variant Sheet (slide-up panel listing variants[])
// ────────────────────────────────────────────────────

interface VariantSheetProps {
    variants: any[];
    onClose: () => void;
    onTryVariant: (problem: string) => void;
}

function VariantSheet({ variants, onClose, onTryVariant }: VariantSheetProps) {
    const difficultyStars = (level: number) =>
        Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < level ? "text-academic-accent" : "text-academic-border"}>★</span>
        ));

    return (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/30" onClick={onClose}>
            <div
                className="bg-white border-t border-academic-border max-h-[70vh] overflow-y-auto animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-white border-b border-academic-border px-6 py-4 flex items-center justify-between">
                    <div>
                        <h3 className="font-playfair font-bold text-xl text-academic-accent">Biến thể bài toán</h3>
                        <p className="text-sm text-academic-neutral italic">Chọn một dạng để luyện tập</p>
                    </div>
                    <button onClick={onClose} className="text-academic-neutral hover:text-academic-ink p-2">✕</button>
                </div>

                <div className="p-6 space-y-4">
                    {(!variants || variants.length === 0) && (
                        <p className="text-center text-academic-neutral italic py-8">Không có dữ liệu biến thể cho bài này.</p>
                    )}
                    {variants?.map((v: any, idx: number) => (
                        <div key={idx} className="border border-academic-border p-5 hover:bg-academic-paper transition-colors">
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-academic-light block mb-1">
                                        {v.variant_type || `Dạng ${idx + 1}`}
                                    </span>
                                    <div className="flex gap-0.5 text-sm">{difficultyStars(v.difficulty || 2)}</div>
                                </div>
                                <button
                                    onClick={() => onTryVariant(v.new_problem)}
                                    className="academic-button !py-2 !px-4 text-xs shrink-0"
                                >
                                    Thử bài này →
                                </button>
                            </div>
                            <p className="text-base text-academic-ink leading-relaxed">{v.new_problem}</p>
                            {v.what_it_tests && (
                                <p className="text-xs text-academic-neutral italic mt-2 border-t border-academic-border/50 pt-2">
                                    Kỹ năng: {v.what_it_tests}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────
// Reverse Problem Modal
// ────────────────────────────────────────────────────

interface ReverseProblemModalProps {
    finalAnswer: string;
    solutionSteps: any[];
    originalQuestion: string;
    onClose: () => void;
}

function ReverseProblemModal({ finalAnswer, solutionSteps, originalQuestion, onClose }: ReverseProblemModalProps) {
    const [userGuess, setUserGuess] = useState("");
    const [revealed, setRevealed] = useState(false);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
            <div
                className="bg-white border border-academic-border shadow-xl max-w-xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="border-b border-academic-border px-6 py-4 flex items-center justify-between">
                    <div>
                        <h3 className="font-playfair font-bold text-xl text-academic-accent">Thử Dạng Ngược</h3>
                        <p className="text-sm text-academic-neutral italic">Từ đáp án và lời giải, hãy phục dựng bài toán gốc</p>
                    </div>
                    <button onClick={onClose} className="text-academic-neutral hover:text-academic-ink p-2">✕</button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Show the answer */}
                    <div className="bg-[#FDFBF7] border border-academic-border p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-academic-light mb-1">Đáp án của bài toán là:</p>
                        <p className="text-2xl font-playfair font-black text-academic-ink">{finalAnswer || "—"}</p>
                    </div>

                    {/* Show key steps (no action text) */}
                    {solutionSteps?.length > 0 && (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-academic-light mb-3">Các bước giải chính:</p>
                            <ol className="space-y-2">
                                {solutionSteps.map((step: any, i: number) => (
                                    <li key={i} className="border-l-2 border-academic-border pl-4 text-sm text-academic-neutral italic">
                                        {step.reasoning}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}

                    {/* User input */}
                    <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-academic-light block mb-2">
                            Bạn nghĩ bài toán gốc đặt ra câu hỏi gì?
                        </label>
                        <textarea
                            value={userGuess}
                            onChange={(e) => setUserGuess(e.target.value)}
                            placeholder="Nhập cách bạn hình dung bài toán..."
                            className="w-full border border-academic-border p-3 text-sm resize-none min-h-[90px] focus:outline-none focus:border-academic-accent"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setRevealed(true)}
                            className="academic-button flex-1 !py-2 text-sm"
                        >
                            Xem bài toán gốc
                        </button>
                    </div>

                    {revealed && (
                        <div className="border-t border-academic-border pt-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-academic-light mb-2">Bài toán gốc:</p>
                            <p className="text-base text-academic-ink leading-relaxed bg-[#FDFBF7] border border-academic-border p-4">
                                {originalQuestion}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
