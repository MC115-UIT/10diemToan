using SmartExamTrainer.Shared.Events;

namespace SmartExamTrainer.Domain.Events;

public class MathProblemSubmittedEvent : IDomainEvent
{
    public Guid CorrelationId { get; }
    public Guid MathRequestId { get; }
    public Guid UserId { get; }
    public string MathContent { get; }
    public string? ImageBase64 { get; }

    public MathProblemSubmittedEvent(Guid correlationId, Guid mathRequestId, Guid userId, string mathContent, string? imageBase64)
    {
        CorrelationId = correlationId;
        MathRequestId = mathRequestId;
        UserId = userId;
        MathContent = mathContent;
        ImageBase64 = imageBase64;
    }
}
