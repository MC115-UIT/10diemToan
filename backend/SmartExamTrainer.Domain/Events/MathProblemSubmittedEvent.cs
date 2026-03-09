using SmartExamTrainer.Shared.Events;

namespace SmartExamTrainer.Domain.Events;

public class MathProblemSubmittedEvent : IDomainEvent
{
    public Guid CorrelationId { get; }
    public Guid MathRequestId { get; }
    public Guid UserId { get; }
    public string MathContent { get; }
    public string? ImageBase64 { get; }
    
    // User Profile for AI Personalization
    public int Grade { get; }
    public string TargetExams { get; }
    public int SelfAssessmentLevel { get; }

    public MathProblemSubmittedEvent(Guid correlationId, Guid mathRequestId, Guid userId, string mathContent, string? imageBase64, int grade, string targetExams, int selfAssessmentLevel)
    {
        CorrelationId = correlationId;
        MathRequestId = mathRequestId;
        UserId = userId;
        MathContent = mathContent;
        ImageBase64 = imageBase64;
        Grade = grade;
        TargetExams = targetExams;
        SelfAssessmentLevel = selfAssessmentLevel;
    }
}
