import api from "@/lib/api";

export interface OnboardUserData {
    grade: number;
    targetExams: string;
    selfAssessmentLevel: number;
}

export class UserService {
    /**
     * Submits the user's initial onboarding profile assessment to the backend.
     */
    static async onboardUser(data: OnboardUserData): Promise<void> {
        await api.post("/user/onboard", data);
    }
}
