"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewChatPage() {
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!input.trim() && !imagePreview) || isLoading) return;

        setIsLoading(true);

        // Store the image in sessionStorage so /chat/new can pick it up after navigation
        if (imagePreview) {
            sessionStorage.setItem("pending_image", imagePreview);
        } else {
            sessionStorage.removeItem("pending_image");
        }

        const q = input.trim() || "Giải bài toán trong ảnh đính kèm";
        router.push(`/chat/new?q=${encodeURIComponent(q)}`);
    };

    return (
        <div className="flex h-full flex-col items-center justify-center p-8 bg-academic-paper font-garamond">
            <div className="max-w-2xl w-full text-center space-y-6">
                {/* Title */}
                <div>
                    <h1 className="text-4xl font-bold font-playfair text-academic-accent mb-3">
                        Bạn cần hỗ trợ bài toán nào hôm nay?
                    </h1>
                    <p className="text-academic-neutral italic text-lg">
                        Nhập bài toán của bạn để nhận hướng dẫn giải chi tiết.
                    </p>
                </div>

                {/* Input form — identical structure to /chat/[id] */}
                <div className="relative font-garamond">
                    {/* Image preview strip */}
                    {imagePreview && (
                        <div className="absolute -top-16 left-0 bg-white border border-academic-border shadow-sm p-1 flex items-center gap-2 z-10">
                            <img src={imagePreview} alt="Preview" className="h-12 w-auto object-contain" />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="text-academic-neutral hover:text-academic-warning p-1 font-bold text-lg leading-none"
                            >
                                &times;
                            </button>
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="relative flex items-end gap-3 bg-white border border-academic-border overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-academic-accent p-1"
                    >
                        <div className="relative flex-1 flex items-center">
                            {/* Image attach button */}
                            <label className="p-3 text-academic-light hover:text-academic-accent hover:bg-academic-paper cursor-pointer transition-colors border-r border-academic-border shrink-0">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={isLoading}
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                    <circle cx="9" cy="9" r="2" />
                                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                </svg>
                            </label>

                            {/* Text input */}
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading}
                                className="w-full pl-4 pr-24 py-3 resize-none focus:outline-none min-h-[50px] max-h-[200px] bg-transparent text-lg placeholder-academic-neutral/60 disabled:bg-academic-paper"
                                placeholder="Nhập bài toán tại đây... (VD: Giải x² - 4x + 4 = 0)"
                                rows={1}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                            />

                            {/* Submit button */}
                            <button
                                type="submit"
                                disabled={isLoading || (!input.trim() && !imagePreview)}
                                className="absolute right-2 p-2 bg-academic-paper border border-academic-border text-academic-accent hover:bg-academic-accent hover:text-white disabled:opacity-40 transition-colors uppercase text-xs font-bold tracking-widest px-4"
                            >
                                {isLoading ? "..." : "Truy vấn"}
                            </button>
                        </div>
                    </form>

                    <div className="text-center mt-3 px-4">
                        <p className="text-xs font-serif text-academic-neutral/80 uppercase tracking-widest">
                            Toán Sâu - Kết quả máy dò lỗi cần được thẩm định minh mẫn
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
