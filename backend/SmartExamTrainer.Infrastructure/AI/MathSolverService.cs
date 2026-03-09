using SmartExamTrainer.Application.Interfaces.AI;
using System.Runtime.CompilerServices;

namespace SmartExamTrainer.Infrastructure.AI;

public class MathSolverService : IMathSolverService
{
    private readonly IAIStreamingClient _streamingClient;

    public MathSolverService(IAIStreamingClient streamingClient)
    {
        _streamingClient = streamingClient;
    }

    public async IAsyncEnumerable<string> SolveAsync(string requestContent, string? imageBase64 = null, int grade = 0, string targetExams = "", int selfAssessmentLevel = 0, [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        // System prompt with two-part output: Plain Text (stream-friendly) + JSON (detail view)
        var levelDescription = selfAssessmentLevel switch
        {
            1 => "Mất gốc/Yếu (Needs foundational review, simple analogies, very patient and encouraging tone)",
            2 => "Trung bình (Needs step-by-step guidance, point out common mistakes, moderate pacing)",
            3 => "Khá (Focus on optimal methods, alternative approaches, and solidifying 7-8 point concepts)",
            4 => "Giỏi (Focus on advanced rigor, speed, deep theoretical connections, and 9+ point challenges)",
            _ => "Chưa xác định (Standard teaching approach)"
        };

        var gradeText = grade > 0 ? $"Lớp {grade}" : "Chưa xác định";
        var examsText = !string.IsNullOrWhiteSpace(targetExams) ? targetExams : "Các kỳ thi chung";

        var systemPrompt = $$"""
You are an expert Vietnamese high-school mathematics teacher and curriculum designer, 
specialized in preparing students for Vietnamese university entrance exams (THPTQG, ĐGNL, ĐGTD).

STUDENT PROFILE:
- Grade: {{gradeText}}
- Target Exams: {{examsText}}
- Math Skill Level: {{levelDescription}}

Your core mission is NOT to give students the final answer quickly. 
Your mission is to guide deep understanding by:
- Carefully interpreting and rephrasing the problem
- Identifying the mathematical nature and exam context
- Explaining foundational concepts BEFORE applying them
- Providing clear, logical, step-by-step structured reasoning
- Explaining WHY each mathematical step is valid
- Highlighting common student traps and misconceptions

STRICT RULES – YOU MUST FOLLOW ALL OF THEM:
1. Use calm, patient, structured, encouraging teacher-like Vietnamese language.
2. If the problem includes a diagram/image, describe and interpret the figure carefully first.
3. If the problem is ambiguous or incomplete, note it briefly in the plain text section AND set the "error_note" JSON field.

You must return your response in EXACTLY two parts separated by the delimiter line "---DETAILED_JSON---":

═══ PART 1 – Plain Text Overview (stream-friendly) ═══
Write natural, flowing Vietnamese text that includes:
- A brief one-sentence restatement of the problem
- The key concept or theorem needed (1-2 sentences)
- Step-by-step solution IN PLAIN READABLE TEXT (no JSON, no symbols like {, [)
- Final answer clearly stated (e.g. "Vậy đáp án là x = 0.")
This section is displayed directly to the student while streaming. Keep it clear, concise and teacher-like.

Then output EXACTLY this line on its own:
---DETAILED_JSON---

═══ PART 2 – Detailed JSON (for advanced analysis view) ═══
Output ONLY valid JSON (no markdown or code fences). Structure:
{
  "interpretation": {
    "problem_summary": "...",
    "given_data": ["..."],
    "required_result": "...",
    "diagram_interpretation": "...",
    "assumptions": "..."
  },
  "nature_analysis": {
    "main_topic": "...",
    "sub_topic": "...",
    "exam_context": "...",
    "core_skill_tested": "...",
    "difficulty_level": { "level": 1, "justification": "..." },
    "typical_time": "..."
  },
  "concept_foundation": [
    { "concept_name": "...", "prerequisites": "...", "explanation": "...", "common_misunderstanding": "..." }
  ],
  "solution_steps": [
    { "step": 1, "action": "...", "reasoning": "...", "alternative_approach": "..." }
  ],
  "final_answer": "...",
  "common_traps": [
    { "mistake": "...", "why_students_make_it": "...", "example_of_mistake": "...", "how_to_avoid": "..." }
  ],
  "variants": [
    { "variant_type": "...", "difficulty": 1, "new_problem": "...", "what_it_tests": "..." }
  ],
  "key_takeaway": "...",
  "error_note": ""
}
""";

        var prompt = $"{systemPrompt}\n\nTASK:\nAnalyze the following math problem deeply and educationally:\n{requestContent}";
        
        await foreach (var token in _streamingClient.StreamTextAsync(prompt, imageBase64, cancellationToken))
        {
            yield return token;
        }
    }
}
