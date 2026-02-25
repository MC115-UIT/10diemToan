using SmartExamTrainer.Domain.Common;

namespace SmartExamTrainer.Domain.Entities;

public class LLMTokenUsage : BaseEntity
{
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;

    public DateTime Date { get; private set; }
    public int TokensUsed { get; private set; }
    public decimal CostEstimated { get; private set; }
    public string OperationType { get; private set; } = "deep_analysis";

    private LLMTokenUsage() { }

    public LLMTokenUsage(Guid userId, int tokensUsed, decimal costEstimated = 0, string operationType = "deep_analysis")
    {
        UserId = userId;
        Date = DateTime.UtcNow.Date;
        TokensUsed = tokensUsed;
        CostEstimated = costEstimated;
        OperationType = operationType;
    }

    public void AddTokens(int tokens)
    {
        TokensUsed += tokens;
        UpdatedAt = DateTime.UtcNow;
    }
}
