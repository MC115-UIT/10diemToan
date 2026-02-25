using SmartExamTrainer.Shared.Events;

namespace SmartExamTrainer.Domain.Events;

public class AIResponseCompletedEvent : IDomainEvent
{
    public Guid MathRequestId { get; }
    public Guid UserId { get; }
    public int PromptTokens { get; }
    public int CompletionTokens { get; }
    public string FinalResponseJson { get; }

    public AIResponseCompletedEvent(Guid mathRequestId, Guid userId, int promptTokens, int completionTokens, string finalResponseJson)
    {
        MathRequestId = mathRequestId;
        UserId = userId;
        PromptTokens = promptTokens;
        CompletionTokens = completionTokens;
        FinalResponseJson = finalResponseJson;
    }
}
