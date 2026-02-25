using SmartExamTrainer.Shared.Events;

namespace SmartExamTrainer.Domain.Events;

public class TokenGeneratedEvent : IDomainEvent
{
    public Guid CorrelationId { get; }
    public string Token { get; }
    public bool IsCompleted { get; }

    public TokenGeneratedEvent(Guid correlationId, string token, bool isCompleted = false)
    {
        CorrelationId = correlationId;
        Token = token;
        IsCompleted = isCompleted;
    }
}
