"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { fetchConversationHistory, toggleMastered, saveToNotebook } from "@/lib/chatApi";
import { Conversation, MathRequest } from "@/types";
import { useMathStream } from "@/hooks/useMathStream";
import { splitStreamContent, parseDetailJson } from "@/hooks/useStreamJsonParser";
import { ActionBar } from "@/components/ActionBar";

export default function ChatPage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [history, setHistory] = useState<MathRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Support pre-filling the input from the URL query params when coming from the dashboard
    const [input, setInput] = useState(() => {
        return (id === "new" && searchParams?.get("q")) ? (searchParams.get("q") as string) : "";
    });

    const hasAutoSubmitted = useRef(false);

    // On /chat/new mount, pick up any pending image stored by the splash page
    useEffect(() => {
        if (id === "new") {
            const pendingImage = sessionStorage.getItem("pending_image");
            if (pendingImage) {
                setImagePreview(pendingImage);
                sessionStorage.removeItem("pending_image");
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-submit initial query
    useEffect(() => {
        if (id === "new" && input && !hasAutoSubmitted.current && !isLoading) {
            hasAutoSubmitted.current = true;
            setTimeout(() => {
                const btn = document.getElementById("chat-submit-btn");
                if (btn) btn.click();
            }, 100);
        }
    }, [id, input, isLoading]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Per-request toggle for the "View Detail" panel
    const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});

    // Add custom state for checking the user's answer
    const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
    const [answerFeedback, setAnswerFeedback] = useState<{ [key: string]: 'correct' | 'wrong' | null }>({});
    const [revealedStepsCount, setRevealedStepsCount] = useState<{ [key: string]: number }>({});

    const [activeRequestId, _setActiveRequestId] = useState<string | null>(null);
    const activeRequestIdRef = useRef<string | null>(null);
    const lastLoadedId = useRef<string | null>(null);
    const currentConvIdRef = useRef<string | null>(null);
    const [streamContentMap, setStreamContentMap] = useState<Record<string, string>>({});
    // Track mastered request IDs - seeded from DB on load, toggled via API
    const [masteredSet, setMasteredSet] = useState<Set<string>>(new Set());

    const setActiveRequestId = (id: string | null) => {
        console.log('[ChatPage] Setting activeRequestId:', id, 'Ref was:', activeRequestIdRef.current);
        activeRequestIdRef.current = id;
        _setActiveRequestId(id);
    };

    const { startStream, resumeStream, streamContent, isStreaming } = useMathStream();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Sync active stream into memoized map
    // Critical fix: We must NOT depend on `isStreaming` here, otherwise an instantly finishing 
    // stream (e.g. fast token replay on reconnect) will turn `isStreaming` false before
    // the hook can save the final tokens, resulting in a blank UI!
    useEffect(() => {
        if (activeRequestId) {
            setStreamContentMap(prev => {
                if (prev[activeRequestId] === streamContent) return prev;
                return { ...prev, [activeRequestId]: streamContent };
            });
        }
    }, [streamContent, activeRequestId]);

    useEffect(() => {
        console.log('[ChatPage] Component mounted or id updated. ID:', id);
        return () => console.log('[ChatPage] Component unmounted or id changing. ID:', id);
    }, [id]);

    useEffect(() => {
        console.log('[ChatPage] URL Param Effect. id:', id, 'lastLoadedId:', lastLoadedId.current);
        if (id && id !== "new" && id !== lastLoadedId.current) {
            currentConvIdRef.current = id as string;
            loadHistory(id as string);
            lastLoadedId.current = id as string;
        } else if (id === "new" && lastLoadedId.current !== "new") {
            currentConvIdRef.current = null;
            setIsLoading(false);
            setConversation(null);
            setHistory([]);
            lastLoadedId.current = "new";
        }
    }, [id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history, streamContent]);

    const loadHistory = async (convId: string, background = false) => {
        if (!background) setIsLoading(true);
        console.log('[ChatPage] loadHistory called for:', convId, 'background:', background);
        try {
            const data = await fetchConversationHistory(convId);
            setConversation(data);
            const mathRequests = data.requests || [];

            setHistory(prev => {
                // Granular merge by ID to prevent background refreshes from wiping optimistic states
                const next = [...prev];
                for (const updatedReq of mathRequests) {
                    const existingIndex = next.findIndex(r => r.id === updatedReq.id);
                    if (existingIndex >= 0) {
                        next[existingIndex] = { ...next[existingIndex], ...updatedReq };
                    } else {
                        next.push(updatedReq);
                    }
                }

                // Seed masteredSet from freshly loaded DB data
                const masteredIds = new Set(mathRequests.filter((r: MathRequest) => r.isMastered).map((r: MathRequest) => r.id)) as Set<string>;
                setMasteredSet(masteredIds);
                // Keep the active optimistic item if it wasn't returned by the server yet
                if (activeRequestIdRef.current) {
                    const activeId = activeRequestIdRef.current;
                    const hasActiveInNext = next.some((r: any) => r.id === activeId);

                    if (!hasActiveInNext) {
                        const activeItem = prev.find(i => i.id === activeId);
                        if (activeItem) {
                            console.log('[ChatPage] Carrying over active item to new history batch:', activeId);
                            next.push(activeItem);
                        }
                    }
                }

                return next.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            });

            if (mathRequests.length > 0) {
                const lastReq = mathRequests[mathRequests.length - 1];
                if (lastReq.status === "Processing" && !isStreaming) {
                    console.log('[ChatPage] Resuming stream for request:', lastReq.id);
                    setActiveRequestId(lastReq.id);
                    resumeStream(lastReq.id, () => {
                        console.log('[ChatPage] Resume stream finished');
                        setActiveRequestId(null);
                        loadHistory(convId, true);
                    });
                }
            }
        } catch (err) {
            console.error('[ChatPage] loadHistory error:', err);
        } finally {
            if (!background) setIsLoading(false);
        }
    };

    // ...

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => { setImageFile(null); setImagePreview(null); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!input.trim() && !imagePreview) || isStreaming) return;

        const content = input || "Giải bài toán trong ảnh đính kèm";
        const currentImageBase64 = imagePreview;
        setInput(""); removeImage();

        const tempId = "temp-" + Date.now();
        console.log('[ChatPage] Creating optimistic request with tempId:', tempId);

        const optimisticQuery: MathRequest = {
            id: tempId,
            content,
            imageBase64: currentImageBase64,
            latexContent: "",
            status: "Processing",
            createdAt: new Date().toISOString(),
            response: null
        };

        setHistory(prev => [...prev, optimisticQuery]);
        setActiveRequestId(tempId);

        let rawBase64 = currentImageBase64;
        if (rawBase64?.startsWith('data:image')) rawBase64 = rawBase64.split(',')[1];

        const targetConvId = currentConvIdRef.current || (id === "new" ? "new" : (id as string));

        await startStream(
            targetConvId,
            content,
            rawBase64,
            (finalConvId: string | undefined) => {
                console.log('[ChatPage] startStream onFinish callback. ConvId:', finalConvId);

                // If we were on /chat/new, ensure the URL is updated if not already
                if (!currentConvIdRef.current && finalConvId) {
                    const newUrl = `/chat/${finalConvId}`;
                    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
                    lastLoadedId.current = finalConvId;
                    currentConvIdRef.current = finalConvId;
                }

                // Final reload to get the permanent record. We keep activeRequestId set until THIS is done
                loadHistory(finalConvId || targetConvId, true).finally(() => {
                    console.log('[ChatPage] Final loadHistory finished. Clearing activeRequestId.');
                    setActiveRequestId(null);
                });
            },
            (realId: string, convId: string) => {
                console.log('[ChatPage] Start stream success. Mapping tempId', tempId, 'to realId', realId, 'ConvId:', convId);

                // Seamless URL update for new conversations
                if (!currentConvIdRef.current && convId) {
                    const newUrl = `/chat/${convId}`;
                    // Update URL without triggerring a re-render/remount
                    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
                    lastLoadedId.current = convId; // Important: prevent useEffect from loading history
                    currentConvIdRef.current = convId;
                }

                // Update the ID of the optimistic item in history so the render loop matches it
                setHistory(prev => prev.map(item => item.id === tempId ? { ...item, id: realId } : item));
                setActiveRequestId(realId);
            }
        );
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

    const toggleDetails = (reqId: string) => {
        setShowDetails(prev => ({ ...prev, [reqId]: !prev[reqId] }));
    };

    // Render the detailed academic breakdown panel (only when detail is toggled on)
    const renderDetailPanel = (reqId: string, jsonString: string | null | undefined) => {
        if (!jsonString) return null;
        const parsed = parseDetailJson(jsonString);
        if (!parsed) return <p className="text-sm text-academic-neutral italic p-4">Chưa có dữ liệu phân tích sâu.</p>;

        const isComplete = true;
        const revealedSteps = revealedStepsCount[reqId] || 1;

        return (
            <div className="mt-6 border-t border-academic-border pt-6 space-y-8">
                {/* Error Note */}
                {parsed.error_note && (
                    <div className="bg-[#FDF2F2] border-l-4 border-academic-warning p-5">
                        <p className="font-playfair font-bold text-academic-warning text-lg mb-1">Lưu ý về Đề bài:</p>
                        <p className="text-academic-ink leading-relaxed">{parsed.error_note}</p>
                    </div>
                )}

                {/* Tier 1: Interpretation */}
                {parsed.interpretation?.problem_summary && (
                    <div>
                        <h3 className="font-playfair text-xl font-bold text-academic-accent mb-3">I. Nhận diện Bài toán</h3>
                        <p className="text-academic-ink bg-white p-5 border border-academic-border shadow-sm text-lg leading-relaxed">{parsed.interpretation.problem_summary}</p>
                        <div className="flex gap-4 text-sm mt-3 flex-wrap">
                            {parsed.nature_analysis?.main_topic && (
                                <div className="border border-academic-border bg-white px-3 py-1 text-academic-light text-xs uppercase tracking-wider font-bold">
                                    Chủ đề: <span className="text-academic-accent ml-1">{parsed.nature_analysis.main_topic}</span>
                                </div>
                            )}
                            {parsed.nature_analysis?.difficulty_level && (
                                <div className="border border-academic-border bg-white px-3 py-1 text-academic-light text-xs uppercase tracking-wider font-bold">
                                    Cấp độ: <span className="text-academic-accent ml-1">{parsed.nature_analysis.difficulty_level.level}/5</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tier 2: Concept Foundation */}
                {parsed.concept_foundation?.length > 0 && (
                    <div className="pt-6 border-t border-academic-border/50">
                        <h3 className="font-playfair text-xl font-bold text-academic-accent mb-4">II. Nền tảng Lý thuyết</h3>
                        <div className="space-y-3">
                            {parsed.concept_foundation.map((concept: any, idx: number) => (
                                <details key={idx} className="group bg-white border border-academic-border shadow-sm open:bg-[#FDFBF7] transition-colors">
                                    <summary className="cursor-pointer font-bold px-5 py-3 text-academic-accent list-none flex justify-between items-center text-base hover:bg-academic-paper/50">
                                        {concept.concept_name}
                                        <span className="text-academic-light group-open:rotate-180 transition-transform font-sans text-sm">▼</span>
                                    </summary>
                                    <div className="px-5 pb-4 text-academic-ink text-base leading-relaxed border-t border-academic-border/30 pt-3">
                                        <p className="mb-3"><span className="font-bold text-academic-accent">Giảng giải: </span>{concept.explanation}</p>
                                        <p className="bg-[#FDF2F2] border-l-4 border-academic-warning p-2 text-sm"><span className="font-bold text-academic-warning">Lỗi ngộ nhận: </span>{concept.common_misunderstanding}</p>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tier 3: Solution Steps */}
                {parsed.solution_steps?.length > 0 && (
                    <div className="pt-6 border-t border-academic-border/50">
                        <h3 className="font-playfair text-xl font-bold text-academic-accent mb-4">III. Lời giải chi tiết theo từng bước</h3>
                        <div className="space-y-5 relative border-l-2 border-academic-border ml-2 pl-5">
                            {parsed.solution_steps.slice(0, revealedSteps).map((step: any, idx: number) => (
                                <div key={idx} className="relative pb-3">
                                    <div className="absolute -left-[29px] top-1.5 h-3 w-3 bg-academic-accent border border-academic-paper"></div>
                                    <h4 className="font-bold text-lg text-academic-ink mb-1">Bước {step.step}: {step.action}</h4>
                                    <p className="text-academic-neutral italic leading-relaxed">{step.reasoning}</p>
                                </div>
                            ))}
                        </div>
                        {revealedSteps < parsed.solution_steps.length && (
                            <div className="mt-6 text-center">
                                <button onClick={() => handleRevealNextStep(reqId, parsed.solution_steps.length)} className="academic-button">
                                    Tiếp tục xem bước tiếp theo ↓
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Tier 4: Final Answer Check */}
                {revealedSteps >= (parsed.solution_steps?.length || 0) && parsed.final_answer && (
                    <div className="pt-6 border-t border-academic-border/50">
                        <div className="bg-white p-6 border border-academic-border shadow-sm">
                            <h3 className="font-playfair text-lg font-bold text-academic-accent mb-3">Kiểm tra Đáp án</h3>
                            <div className="flex gap-3 mb-4">
                                <input
                                    type="text"
                                    placeholder="Nhập kết quả của bạn (VD: x=0, 10)..."
                                    className="flex-1 border-b-2 border-academic-border bg-transparent px-2 py-2 text-base focus:border-academic-accent focus:outline-none font-garamond"
                                    value={userAnswers[reqId] || ""}
                                    onChange={e => setUserAnswers(prev => ({ ...prev, [reqId]: e.target.value }))}
                                />
                                <button onClick={() => handleCheckAnswer(reqId, parsed.final_answer)} className="academic-button !py-1 !px-5 text-sm">Đánh giá</button>
                            </div>
                            {answerFeedback[reqId] === 'correct' && (
                                <div className="p-3 bg-[#F2F7F2] border-l-4 border-academic-success text-academic-success font-bold">✓ Đáp án chính xác.</div>
                            )}
                            {answerFeedback[reqId] === 'wrong' && (
                                <div className="p-3 bg-[#FDF2F2] border-l-4 border-academic-warning text-academic-warning font-bold">× Chưa chính xác. Xem lại các bước.</div>
                            )}
                            {(answerFeedback[reqId] != null || !parsed.solution_steps?.length) && (
                                <div className="pt-5 border-t border-academic-border/30 mt-4">
                                    <span className="text-academic-light uppercase text-xs font-bold tracking-widest block mb-1">Đáp Án Chính Thức</span>
                                    <p className="text-3xl font-playfair font-black text-academic-ink">{parsed.final_answer}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Key Takeaway */}
                {parsed.key_takeaway && (
                    <div className="bg-[#FAF8F5] border border-academic-border p-5 shadow-sm">
                        <p className="text-xs uppercase font-playfair font-bold text-academic-accent tracking-widest mb-2 border-b border-academic-border pb-2 inline-block">Đúc kết & Ghi chú</p>
                        <p className="text-academic-ink italic leading-relaxed">{parsed.key_takeaway}</p>
                    </div>
                )}
            </div>
        );
    };

    if (isLoading) return <div className="flex h-full items-center justify-center">Đang tải dữ liệu...</div>;

    return (
        <div className="flex flex-col h-full relative bg-academic-paper font-garamond text-academic-ink">
            {/* Header */}
            <div className="bg-academic-paper border-b border-academic-border px-6 py-4 fixed w-[calc(100%-16rem)] z-10 flex items-center shadow-sm">
                <h2 className="text-xl font-bold font-playfair text-academic-accent">{conversation?.title || "Giải Thuật Toán Học"}</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto pt-20 pb-40 px-6 sm:px-12 md:px-24">
                <div className="max-w-3xl mx-auto space-y-8">
                    {history.map((req) => {
                        const isActiveStream = req.id === activeRequestId;

                        if (isActiveStream || req.status === "Processing") {
                            console.log('[ChatPage] Rendering item:', req.id, {
                                isActiveStream,
                                status: req.status,
                                activeRequestId,
                                streamLength: streamContent.length,
                                hasResponse: !!req.response
                            });
                        }

                        // rawContent: use live streamContent for active stream, stored JSON for completed, and memoized stream for the DB-save race condition gap
                        const memoizedContent = streamContentMap[req.id] || "";
                        let rawContent = req.response?.responseJson || memoizedContent;
                        if (isActiveStream) rawContent = streamContent;

                        const { textPart, jsonPart, hasDelimiter } = splitStreamContent(rawContent);
                        const isDetailOpen = showDetails[req.id] || false;
                        // Show the AI response panel if: has a saved response, OR it's the active stream, OR it's processing (waiting), OR we have memoized content
                        const hasAiResponse = req.response != null || isActiveStream || req.status === "Processing" || !!memoizedContent;

                        return (
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

                                {/* AI Answer */}
                                {hasAiResponse && (
                                    <div className="flex justify-start">
                                        <div className="w-full max-w-3xl bg-white border border-academic-border shadow-sm rounded-sm overflow-hidden font-garamond text-academic-ink">

                                            {/* ── Content area with padding ── */}
                                            <div className="px-8 py-8">
                                                {/* === Part 1: Plain Text (stream) or Loading indicator === */}
                                                {(textPart || hasDelimiter) ? (
                                                    <div className="text-lg leading-relaxed whitespace-pre-wrap text-academic-ink mb-2">
                                                        {textPart}
                                                        {isActiveStream && !hasDelimiter && (
                                                            <span className="inline-block w-2 h-4 bg-academic-accent animate-pulse ml-1 align-middle" />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3 text-academic-light font-playfair text-lg animate-pulse italic mb-4">
                                                        <span className="h-1.5 w-1.5 bg-academic-accent rounded-full"></span>
                                                        <span className="h-1.5 w-1.5 bg-academic-accent rounded-full animation-delay-200"></span>
                                                        <span className="h-1.5 w-1.5 bg-academic-accent rounded-full animation-delay-400"></span>
                                                        Đang phân tích...
                                                    </div>
                                                )}

                                                {/* Indicator while JSON is being streamed in Part 2 */}
                                                {isActiveStream && hasDelimiter && (
                                                    <p className="mt-4 text-xs text-academic-neutral italic animate-pulse">Đang tổng hợp phân tích sâu...</p>
                                                )}

                                                {/* === Toggle Button for Detail View === */}
                                                {(hasDelimiter || !isActiveStream) && jsonPart && (
                                                    <div className="mt-6 pt-4 border-t border-academic-border/50">
                                                        <button
                                                            onClick={() => toggleDetails(req.id)}
                                                            className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-academic-accent hover:text-academic-ink transition-colors border border-academic-border px-4 py-2 hover:bg-academic-paper"
                                                        >
                                                            <span>{isDetailOpen ? "▲" : "▼"}</span>
                                                            {isDetailOpen ? "Ẩn phân tích sâu" : "Xem phân tích sâu"}
                                                        </button>
                                                    </div>
                                                )}

                                                {/* === Part 2: Detailed JSON Panel (conditionally rendered) === */}
                                                {isDetailOpen && renderDetailPanel(req.id, jsonPart)}
                                            </div>

                                            {/* === Persistent Action Bar — flush bottom of card === */}
                                            {!isActiveStream && req.response != null && jsonPart && (() => {
                                                const parsed = parseDetailJson(jsonPart);
                                                if (!parsed) return null;
                                                return (
                                                    <ActionBar
                                                        requestId={req.id}
                                                        variants={parsed.variants || []}
                                                        finalAnswer={parsed.final_answer || ""}
                                                        mainTopic={parsed.nature_analysis?.main_topic || ""}
                                                        question={req.content}
                                                        solutionSteps={parsed.solution_steps || []}
                                                        isMastered={masteredSet.has(req.id)}
                                                        onToggleMastered={async (id) => {
                                                            setMasteredSet(prev => {
                                                                const next = new Set(prev);
                                                                if (next.has(id)) next.delete(id); else next.add(id);
                                                                return next;
                                                            });
                                                            try { await toggleMastered(id); } catch { /* revert on error */ }
                                                        }}
                                                        onSaveToNotebook={async (id, topic, note) => {
                                                            try { await saveToNotebook(id, topic, note); } catch (e) { console.error('Notebook save failed', e); }
                                                        }}
                                                        onPracticeNow={(variantProblem) => {
                                                            setInput(variantProblem);
                                                            setTimeout(() => {
                                                                const btn = document.getElementById("chat-submit-btn");
                                                                if (btn) btn.click();
                                                            }, 50);
                                                        }}
                                                    />
                                                );
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
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
                                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
                                }}
                            />
                            <button
                                id="chat-submit-btn"
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
