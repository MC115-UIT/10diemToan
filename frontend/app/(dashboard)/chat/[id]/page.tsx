"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { SendHorizontal } from "lucide-react";
import { fetchConversationHistory } from "@/lib/chatApi";
import { Conversation, MathRequest } from "@/types";
import { useMathStream } from "@/hooks/useMathStream";
import { useStreamJsonParser } from "@/hooks/useStreamJsonParser";

export default function ChatPage() {
    const { id } = useParams();
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [history, setHistory] = useState<MathRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [input, setInput] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Track which step the user is currently viewing in the Progressive Reveal
    const [revealedStepsCount, setRevealedStepsCount] = useState<{ [key: string]: number }>({});

    // Add custom state for checking the user's answer
    const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
    const [answerFeedback, setAnswerFeedback] = useState<{ [key: string]: 'correct' | 'wrong' | null }>({});

    const { startStream, streamContent, isStreaming } = useMathStream();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Parse live or historical JSON
    const getParsedJson = (req: MathRequest) => {
        if (req.status === "Processing" && isStreaming) {
            return useStreamJsonParser(streamContent);
        }
        if (req.response?.responseJson) {
            try { return JSON.parse(req.response.responseJson); } catch { return {}; }
        }
        return {};
    };

    const handleRevealNextStep = (reqId: string, maxSteps: number) => {
        setRevealedStepsCount(prev => {
            const current = prev[reqId] || 1;
            return { ...prev, [reqId]: Math.min(current + 1, maxSteps) };
        });
    };

    const handleCheckAnswer = (reqId: string, correctAnswer: string) => {
        const userAnswer = userAnswers[reqId]?.trim().toLowerCase();
        const expected = correctAnswer?.trim().toLowerCase();

        if (userAnswer === expected || expected.includes(userAnswer)) {
            setAnswerFeedback(prev => ({ ...prev, [reqId]: 'correct' }));
        } else {
            setAnswerFeedback(prev => ({ ...prev, [reqId]: 'wrong' }));
        }
    };

    useEffect(() => {
        if (id) {
            loadHistory(id as string);
        }
    }, [id]);

    useEffect(() => {
        // Scroll to bottom whenever history or stream content changes
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history, streamContent]);

    const loadHistory = async (convId: string) => {
        setIsLoading(true);
        try {
            const data = await fetchConversationHistory(convId);
            setConversation(data);
            // Ensure backend returns something like { conversation, history: [...] } or just an array
            // Let's assume it returns { id, title, mathRequests: [...] } based on domain
            setHistory(data.mathRequests || []);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!input.trim() && !imagePreview) || isStreaming) return;

        const content = input || "Giải bài toán trong ảnh đính kèm";
        const currentImageBase64 = imagePreview; // Save instance for closure

        setInput("");
        removeImage();

        // Optimistic UI for User Query
        const optimisticQuery: MathRequest = {
            id: "temp-" + Date.now(),
            content: content,
            imageBase64: currentImageBase64,
            latexContent: "",
            status: "Processing",
            createdAt: new Date().toISOString(),
            response: null
        };
        setHistory(prev => [...prev, optimisticQuery]);

        // Remove the data URI scheme if present to just send the raw base64 string to the backend
        let rawBase64 = currentImageBase64;
        if (rawBase64 && rawBase64.startsWith('data:image')) {
            rawBase64 = rawBase64.split(',')[1];
        }

        await startStream(id as string, content, rawBase64, () => {
            // On finish, reload history from server to get accurate IDs and JSON
            loadHistory(id as string);
        });
    };

    if (isLoading) {
        return <div className="flex h-full items-center justify-center">Loading...</div>;
    }

    return (
        <div className="flex flex-col h-full relative bg-academic-paper font-garamond text-academic-ink">
            {/* Header */}
            <div className="bg-academic-paper border-b border-academic-border px-6 py-4 fixed w-[calc(100%-16rem)] z-10 flex items-center shadow-sm">
                <h2 className="text-xl font-bold font-playfair text-academic-accent">{conversation?.title || "Giải Thuật Toán Học"}</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto pt-20 pb-40 px-6 sm:px-12 md:px-24">
                <div className="max-w-3xl mx-auto space-y-8">
                    {history.map((req) => (
                        <div key={req.id} className="space-y-4">
                            {/* User Question */}
                            <div className="flex justify-end mb-8 mt-4">
                                <div className="bg-white border border-academic-border shadow-sm rounded-sm px-6 py-4 max-w-[85%] whitespace-pre-wrap flex flex-col gap-3">
                                    <span className="text-xs font-bold uppercase tracking-wider text-academic-light border-b border-academic-border pb-1 mb-1">Đề bài của học sinh</span>
                                    {req.imageBase64 && (
                                        <img src={req.imageBase64.startsWith('data:image') ? req.imageBase64 : `data:image/jpeg;base64,${req.imageBase64}`}
                                            alt="User uploaded math problem"
                                            className="max-w-full h-auto max-h-[350px] object-contain align-middle border border-academic-border p-1 bg-academic-paper" />
                                    )}
                                    {req.content && <span className="text-lg leading-relaxed text-academic-ink">{req.content}</span>}
                                </div>
                            </div>

                            {/* AI Answer - Progressive Reveal */}
                            {(req.response || (req.status === "Processing" && isStreaming)) && (() => {
                                const parsed = getParsedJson(req);
                                const isComplete = req.status === "Completed" || req.response != null;
                                const revealedSteps = revealedStepsCount[req.id] || 1;

                                return (
                                    <div className="flex justify-start">
                                        <div className="w-full max-w-3xl bg-academic-paper border border-academic-border shadow-sm rounded-sm px-8 py-10 font-garamond text-academic-ink">

                                            {/* Error Note */}
                                            {parsed.error_note && (
                                                <div className="bg-[#FDF2F2] border-l-4 border-academic-warning p-5 mb-8">
                                                    <p className="font-playfair font-bold text-academic-warning text-lg mb-1">Lưu ý về Đề bài:</p>
                                                    <p className="text-academic-ink leading-relaxed">{parsed.error_note}</p>
                                                </div>
                                            )}

                                            {/* Tier 1: The Big Picture */}
                                            {parsed.interpretation?.problem_summary && (
                                                <div className="mb-10">
                                                    <h3 className="font-playfair text-2xl font-bold text-academic-accent mb-4">I. Nhận diện Bài toán</h3>
                                                    <p className="text-academic-ink bg-white p-5 border border-academic-border shadow-sm text-lg leading-relaxed mb-4">{parsed.interpretation.problem_summary}</p>
                                                    <div className="flex gap-4 text-sm mt-4">
                                                        {parsed.nature_analysis?.main_topic && (
                                                            <div className="border border-academic-border bg-white px-3 py-1 text-academic-light text-xs uppercase tracking-wider font-bold">
                                                                Chủ đề: <span className="text-academic-accent ml-1">{parsed.nature_analysis.main_topic}</span>
                                                            </div>
                                                        )}
                                                        {parsed.nature_analysis?.difficulty_level && (
                                                            <div className="border border-academic-border bg-white px-3 py-1 text-academic-light text-xs uppercase tracking-wider font-bold">
                                                                Học thuật: <span className="text-academic-accent ml-1">Cấp độ {parsed.nature_analysis.difficulty_level.level}/5</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Tier 2: Concept Foundation */}
                                            {parsed.concept_foundation?.length > 0 && (
                                                <div className="mb-10 pt-8 border-t border-academic-border/50">
                                                    <h3 className="font-playfair text-2xl font-bold text-academic-accent mb-5">II. Nền tảng Lý thuyết & Khái niệm</h3>
                                                    <div className="space-y-4">
                                                        {parsed.concept_foundation.map((concept: any, idx: number) => (
                                                            <details key={idx} className="group bg-white border border-academic-border shadow-sm open:bg-[#FDFBF7] transition-colors rounded-none">
                                                                <summary className="cursor-pointer font-bold px-6 py-4 text-academic-accent list-none flex justify-between items-center text-lg hover:bg-academic-paper/50">
                                                                    {concept.concept_name}
                                                                    <span className="text-academic-light group-open:rotate-180 transition-transform font-sans text-sm">▼</span>
                                                                </summary>
                                                                <div className="px-6 pb-5 text-academic-ink text-lg leading-relaxed border-t border-academic-border/30 pt-4">
                                                                    <p className="mb-4"><span className="font-bold text-academic-accent">Giảng giải: </span>{concept.explanation}</p>
                                                                    <p className="bg-[#FDF2F2] border-l-4 border-academic-warning p-3"><span className="font-bold text-academic-warning">Lỗi ngộ nhận: </span>{concept.common_misunderstanding}</p>
                                                                </div>
                                                            </details>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Tier 3: Solution Steps - Smart Reveal */}
                                            {parsed.solution_steps?.length > 0 && (
                                                <div className="mb-10 pt-8 border-t border-academic-border/50">
                                                    <h3 className="font-playfair text-2xl font-bold text-academic-accent mb-6">III. Trình bày Lời giải chi tiết</h3>
                                                    <div className="space-y-6 relative border-l-2 border-academic-border ml-2 pl-6">
                                                        {parsed.solution_steps.slice(0, revealedSteps).map((step: any, idx: number) => (
                                                            <div key={idx} className="relative pb-4">
                                                                <div className="absolute -left-[31px] top-1.5 h-3 w-3 bg-academic-accent border border-academic-paper"></div>
                                                                <h4 className="font-bold text-xl text-academic-ink mb-2">Bước {step.step}: {step.action}</h4>
                                                                <p className="text-academic-neutral text-lg italic leading-relaxed">{step.reasoning}</p>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Next Step Button */}
                                                    {isComplete && revealedSteps < parsed.solution_steps.length && (
                                                        <div className="mt-8 text-center pt-4">
                                                            <button
                                                                onClick={() => handleRevealNextStep(req.id, parsed.solution_steps.length)}
                                                                className="academic-button"
                                                            >
                                                                Tiếp tục suy luận & Xem bước tiếp theo ↓
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Tier 4: Final Answer & Check */}
                                            {isComplete && revealedSteps >= (parsed.solution_steps?.length || 0) && parsed.final_answer && (
                                                <div className="mb-8 pt-8 border-t border-academic-border/50">
                                                    <div className="bg-white p-8 border border-academic-border shadow-sm relative">
                                                        <h3 className="font-playfair text-xl font-bold text-academic-accent mb-4">Kiểm tra Đáp án Tự luận</h3>
                                                        <div className="flex gap-3 mb-6">
                                                            <input
                                                                type="text"
                                                                placeholder="Ghi nhận kết quả của sinh viên (VD: 10, x=2)..."
                                                                className="flex-1 border-b-2 border-academic-border bg-transparent px-2 py-3 text-lg focus:border-academic-accent focus:outline-none placeholder-academic-neutral/50 font-garamond"
                                                                value={userAnswers[req.id] || ""}
                                                                onChange={e => setUserAnswers(prev => ({ ...prev, [req.id]: e.target.value }))}
                                                            />
                                                            <button
                                                                onClick={() => handleCheckAnswer(req.id, parsed.final_answer)}
                                                                className="academic-button !py-2 !px-6"
                                                            >
                                                                Đánh giá
                                                            </button>
                                                        </div>

                                                        {answerFeedback[req.id] === 'correct' && (
                                                            <div className="mb-6 p-4 bg-[#F2F7F2] border-l-4 border-academic-success text-academic-success text-lg font-bold">
                                                                ✓ Xác nhận: Đáp án hoàn toàn chính xác.
                                                            </div>
                                                        )}
                                                        {answerFeedback[req.id] === 'wrong' && (
                                                            <div className="mb-6 p-4 bg-[#FDF2F2] border-l-4 border-academic-warning text-academic-warning text-lg font-bold">
                                                                × Chưa chính xác. Lời khuyên: Vui lòng rà soát lại các phép biến đổi đại số cuối cùng.
                                                            </div>
                                                        )}

                                                        {(answerFeedback[req.id] != null || !parsed.solution_steps?.length) && (
                                                            <div className="pt-6 border-t border-academic-border/30 mt-6">
                                                                <span className="text-academic-light uppercase text-sm font-bold tracking-widest block mb-2">Kết Luận Chính Thức</span>
                                                                <p className="text-4xl font-playfair font-black text-academic-ink">{parsed.final_answer}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Key Takeaway */}
                                            {isComplete && parsed.key_takeaway && (
                                                <div className="bg-[#FAF8F5] border border-academic-border p-6 mt-6 shadow-sm">
                                                    <p className="text-sm uppercase font-playfair font-bold text-academic-accent tracking-widest mb-3 border-b border-academic-border pb-2 inline-block">Đúc kết & Ghi chú</p>
                                                    <p className="text-academic-ink italic text-lg leading-relaxed">{parsed.key_takeaway}</p>
                                                </div>
                                            )}

                                            {/* Steamer pulse indicator */}
                                            {req.status === "Processing" && isStreaming && (
                                                <div className="flex items-center gap-3 mt-8 text-academic-light font-playfair text-lg animate-pulse italic">
                                                    <span className="h-1.5 w-1.5 bg-academic-accent rounded-full"></span>
                                                    Đang biện luận phân tích...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Form */}
            <div className="absolute bottom-0 w-full bg-academic-paper border-t border-academic-border pt-6 pb-6 px-6 sm:px-12 md:px-24">
                <div className="max-w-3xl mx-auto relative font-garamond">
                    {imagePreview && (
                        <div className="absolute -top-16 left-0 bg-white border border-academic-border shadow-sm p-1 flex items-center gap-2">
                            <img src={imagePreview} alt="Preview" className="h-12 w-auto object-contain" />
                            <button type="button" onClick={removeImage} className="text-academic-neutral hover:text-academic-warning p-1 font-bold text-lg leading-none">
                                &times;
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="relative flex items-end gap-3 bg-white border border-academic-border overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-academic-accent p-1">
                        <div className="relative flex-1 flex items-center">
                            <label className="p-3 text-academic-light hover:text-academic-accent hover:bg-academic-paper cursor-pointer transition-colors border-r border-academic-border">
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isStreaming} />
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                            </label>
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isStreaming}
                                className="w-full pl-4 pr-16 py-3 resize-none focus:outline-none min-h-[50px] max-h-[150px] bg-transparent disabled:bg-academic-paper text-lg placeholder-academic-neutral/60"
                                placeholder="..."
                                rows={1}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                            />
                            <button
                                type="submit"
                                disabled={isStreaming || (!input.trim() && !imagePreview)}
                                className="absolute right-2 p-2 bg-academic-paper border border-academic-border text-academic-accent hover:bg-academic-accent hover:text-white disabled:opacity-40 transition-colors uppercase text-xs font-bold tracking-widest px-4"
                            >
                                Truy vấn
                            </button>
                        </div>
                    </form>
                    <div className="text-center mt-3 px-4">
                        <p className="text-xs font-serif text-academic-neutral/80 uppercase tracking-widest">Toán Sâu - Kết quả máy dò lỗi cần được thẩm định minh mẫn</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
