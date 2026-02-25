export interface User {
    id: string;
    email: string;
    role: string;
    fullName?: string;
    isPremium?: boolean;
    isOnboarded?: boolean;
    grade?: number;
    targetExams?: string;
    selfAssessmentLevel?: number;
    streakDays?: number;
    dailyDeepQuestionsUsed?: number;
}

export interface Conversation {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
}

export interface MathRequest {
    id: string;
    content: string;
    imageBase64?: string | null;
    latexContent: string;
    status: string;
    createdAt: string;
    response: AIResponse | null;
}

export interface AIResponse {
    id: string;
    responseJson: string; // The raw JSON from the Master Prompt
    promptTokens: number;
    completionTokens: number;
    createdAt: string;
}
