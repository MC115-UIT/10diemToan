import { Conversation } from "@/types";
import api from "@/lib/api";

export async function fetchConversations(): Promise<Conversation[]> {
    const res = await api.get('/conversations');
    return res.data;
}

export async function createConversation(initialMessage: string): Promise<{ mathRequestId: string, conversationId: string }> {
    const res = await api.post('/math/solve', { content: initialMessage });
    // Backend returns SolveMathProblemResponse { MathRequestId, ConversationId }
    // Axios usually keeps the casing unless configured otherwise, assuming camelCase from .NET JSON serializer.
    return res.data;
}

export async function fetchConversationHistory(id: string) {
    const res = await api.get(`/conversations/${id}`);
    return res.data;
}
