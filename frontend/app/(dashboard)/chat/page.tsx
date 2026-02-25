"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SendHorizontal } from "lucide-react";
import api from "@/lib/api";

export default function NewChatPage() {
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        setIsLoading(true);
        try {
            // Create a MathRequest/Conversation
            // Note: currently the backend MathController takes ConversationId, but we might just pass empty/null for a new one.
            // E.g.: SolveMathProblemCommand
            const res = await api.post('/math/solve', { content: input });
            // The backend needs to return the ConversationId so we can redirect to `/chat/${conversationId}`
            // Assume backend is fixed to return { conversationId: "..." }
            if (res.data?.conversationId) {
                router.push(`/chat/${res.data.conversationId}`);
            } else {
                // Fallback if backend hasn't been updated to return conversation ID directly,
                // We might just clear input and tell user to check sidebar (not ideal, but MVP)
                setInput("");
                alert("Problem submitted. Check your sidebar shortly.");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to submit." + (err as any).response?.data?.errors);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-full flex-col items-center justify-center p-8">
            <div className="max-w-2xl w-full text-center space-y-8">
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">How can I help you with Math today?</h1>
                <p className="text-gray-500">Enter a math problem to get step-by-step guidance based on Vietnamese curriculum standards.</p>

                <form onSubmit={handleSubmit} className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full rounded-2xl border border-gray-300 shadow-sm px-4 py-4 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                        placeholder="Type your math problem here... (e.g. Solve x^2 - 4x + 4 = 0)"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="absolute bottom-4 right-4 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:bg-gray-400 transition-colors"
                    >
                        <SendHorizontal size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
