import { useState, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

export function useMathStream() {
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamContent, setStreamContent] = useState("");
    const abortControllerRef = useRef<AbortController | null>(null);

    const openFetchStream = useCallback(async (url: string, onFinish?: (convId?: string) => void, contextConvId?: string) => {
        const token = useAuthStore.getState().accessToken;
        console.log('[SSE] Opening fetch stream:', url);

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                signal: controller.signal,
            });

            if (!response.ok || !response.body) {
                setIsStreaming(false);
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const data = line.slice(6);

                    if (data === '[DONE]') {
                        setIsStreaming(false);
                        abortControllerRef.current = null;
                        if (onFinish) onFinish(contextConvId);
                        return;
                    }

                    const tok = data.replace(/\\n/g, '\n');
                    setStreamContent((prev) => {
                        const next = prev + tok;
                        if (next.length % 50 === 0) console.log('[SSE] Accumulating tokens. Current length:', next.length);
                        return next;
                    });
                }
            }
        } catch (err: any) {
            if (err?.name !== 'AbortError') console.error('[SSE] Fetch stream error:', err);
        } finally {
            setIsStreaming(false);
            abortControllerRef.current = null;
        }
    }, []);

    const startStream = useCallback(async (
        conversationId: string,
        content: string,
        imageBase64?: string | null,
        onFinish?: (convId?: string) => void,
        onMathRequestId?: (id: string, convId: string) => void
    ) => {
        setIsStreaming(true);
        setStreamContent("");

        try {
            const res = await api.post('/math/solve', { conversationId: conversationId === "new" ? null : conversationId, content, imageBase64 });
            const { mathRequestId, conversationId: actualConvId } = res.data;

            if (!mathRequestId) throw new Error("No mathRequestId returned");

            if (onMathRequestId) onMathRequestId(mathRequestId, actualConvId);

            const streamUrl = `${api.defaults.baseURL}/math/stream/${mathRequestId}`;
            openFetchStream(streamUrl, onFinish, actualConvId);

        } catch (err) {
            console.error('[Stream] startStream error:', err);
            setIsStreaming(false);
        }
    }, [openFetchStream]);

    const resumeStream = useCallback((mathRequestId: string, onFinish?: (convId?: string) => void) => {
        setIsStreaming(true);
        setStreamContent("");
        const streamUrl = `${api.defaults.baseURL}/math/stream/${mathRequestId}`;
        openFetchStream(streamUrl, onFinish);
    }, [openFetchStream]);

    const stopStream = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsStreaming(false);
        }
    }, []);

    return { isStreaming, streamContent, startStream, resumeStream, stopStream };
}
