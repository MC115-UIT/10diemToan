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

export async function renameConversation(id: string, newTitle: string): Promise<void> {
    await api.put(`/conversations/${id}/rename`, { newTitle });
}

export async function deleteConversation(id: string): Promise<void> {
    await api.delete(`/conversations/${id}`);
}

export async function toggleMastered(mathRequestId: string): Promise<void> {
    await api.put(`/math-requests/${mathRequestId}/mastered`);
}

export async function saveToNotebook(mathRequestId: string, topic: string, userNote: string, tags: string = ""): Promise<{ id: string }> {
    const res = await api.post('/notebook', { mathRequestId, topic, userNote, tags });
    return res.data;
}

export async function fetchNotebook(): Promise<any[]> {
    const res = await api.get('/notebook');
    return res.data;
}
