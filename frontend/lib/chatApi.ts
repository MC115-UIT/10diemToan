import { Conversation } from "@/types";
import api from "@/lib/api";

export async function fetchConversations(): Promise<Conversation[]> {
    const res = await api.get('/conversations');
    return res.data;
}

export async function createConversation(initialMessage: string): Promise<{ id: string }> {
    const res = await api.post('/math/solve', { content: initialMessage });
    return res.data; // backend returning Result.Ok(mathRequest.Id) currently; we need the Conversation ID in reality to redirect, but for MVP we might just refresh list or adjust backend later.
}

export async function fetchConversationHistory(id: string) {
    const res = await api.get(`/conversations/${id}`);
    return res.data;
}
