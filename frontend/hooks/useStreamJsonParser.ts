import { useState, useEffect } from 'react';

export function useStreamJsonParser(rawString: string) {
    const [parsedData, setParsedData] = useState<any>({});

    useEffect(() => {
        if (!rawString) {
            setParsedData({});
            return;
        }

        try {
            // Best effort direct parse first (if complete)
            const json = JSON.parse(rawString);
            setParsedData(json);
            return;
        } catch {
            // It's incomplete, let's extract known blocks manually using Regex or iterative parsing
            // This is a naive but fast progressive parser
            const extractObject = (key: string) => {
                const regex = new RegExp(`"${key}"\\s*:\\s*({[^}]*})`, 's');
                const match = regex.exec(rawString);
                if (match) {
                    try { return JSON.parse(match[1] + (match[1].endsWith('}') ? '' : '...}')); }
                    catch { /* swallow inner parse errors while streaming */ }
                }
                return null;
            };

            const extractArray = (key: string) => {
                const regex = new RegExp(`"${key}"\\s*:\\s*(\\[.*?(?:\\]|$)`, 's');
                const match = regex.exec(rawString);
                if (match) {
                    try {
                        // attempt to close the array if streaming stopped halfway
                        let str = match[1];
                        if (!str.endsWith(']')) str += ']';
                        // also if last object is broken, we should ideally fix it but this is basic
                        return JSON.parse(str);
                    }
                    catch { /* swallow */ }
                }
                return [];
            };

            const extractString = (key: string) => {
                const regex = new RegExp(`"${key}"\\s*:\\s*"([^"]*)`, 's');
                const match = regex.exec(rawString);
                return match ? match[1] : "";
            };

            setParsedData({
                interpretation: extractObject("interpretation") || {},
                nature_analysis: extractObject("nature_analysis") || {},
                concept_foundation: extractArray("concept_foundation") || [],
                solution_steps: extractArray("solution_steps") || [],
                final_answer: extractString("final_answer"),
                common_traps: extractArray("common_traps") || [],
                variants: extractArray("variants") || [],
                key_takeaway: extractString("key_takeaway"),
                error_note: extractString("error_note"),
            });
        }
    }, [rawString]);

    return parsedData;
}
