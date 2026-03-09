const DELIMITER = "---DETAILED_JSON---";

/**
 * Splits the raw accumulated stream string into two parts:
 * - textPart: Plain Vietnamese text for immediate display.
 * - jsonPart: The structured JSON block for the "View Detail" analysis panel.
 * - hasDelimiter: Whether the delimiter has been streamed yet.
 */
export function splitStreamContent(rawString: string) {
    const delimiterIndex = rawString.indexOf(DELIMITER);
    if (delimiterIndex === -1) {
        return {
            textPart: rawString,
            jsonPart: "",
            hasDelimiter: false,
        };
    }
    return {
        textPart: rawString.substring(0, delimiterIndex).trim(),
        jsonPart: rawString.substring(delimiterIndex + DELIMITER.length).trim(),
        hasDelimiter: true,
    };
}

/**
 * Parses the JSON part of the response. This should only be called when the full
 * response is available (e.g., from the DB after streaming is complete or when
 * the user clicks "View Detail").
 */
export function parseDetailJson(jsonString: string) {
    if (!jsonString) return null;
    try {
        return JSON.parse(jsonString);
    } catch {
        return null;
    }
}
