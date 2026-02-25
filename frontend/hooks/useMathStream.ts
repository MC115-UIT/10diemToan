import { useState, useCallback, useRef } from 'react';
import api from '@/lib/api';

export function useMathStream() {
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamContent, setStreamContent] = useState("");
    const eventSourceRef = useRef<EventSource | null>(null);

    const startStream = useCallback(async (conversationId: string, content: string, imageBase64?: string | null, onFinish?: () => void) => {
        setIsStreaming(true);
        setStreamContent("");

        try {
            // 1. Submit command
            const res = await api.post('/math/solve', {
                conversationId,
                content,
                imageBase64
            });

            const mathRequestId = res.data.mathRequestId; // The ID of the command mapped to CorrelationID

            if (!mathRequestId) {
                throw new Error("No Tracking ID returned from solve endpoint");
            }

            // 2. Connect SSE bridging cookies over EventSource plugin if possible, 
            // but native EventSource uses withCredentials
            const streamUrl = `${api.defaults.baseURL}/math/stream/${mathRequestId}`;
            const es = new EventSource(streamUrl, { withCredentials: true });
            eventSourceRef.current = es;

            es.onmessage = (event) => {
                if (event.data === "[DONE]") {
                    es.close();
                    setIsStreaming(false);
                    eventSourceRef.current = null;
                    if (onFinish) onFinish();
                    return;
                }

                // We accumulate the string
                // The backend `Replace("\\n")` logic may send literal \n strings, so we parse it.
                const token = event.data.replace(/\\n/g, '\n');
                setStreamContent((prev) => prev + token);
            };

            es.onerror = (err) => {
                console.error("SSE Error:", err);
                es.close();
                setIsStreaming(false);
                eventSourceRef.current = null;
            };

        } catch (err) {
            console.error(err);
            setIsStreaming(false);
        }
    }, []);

    const stopStream = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
            setIsStreaming(false);
        }
    }, []);

    return {
        isStreaming,
        streamContent,
        startStream,
        stopStream
    };
}
