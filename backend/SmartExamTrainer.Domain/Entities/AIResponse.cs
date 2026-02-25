using SmartExamTrainer.Domain.Common;

namespace SmartExamTrainer.Domain.Entities;

public class AIResponse : BaseEntity
{
    public Guid MathRequestId { get; private set; }
    public MathRequest Request { get; private set; } = null!;

    public string ResponseJson { get; private set; } = string.Empty;
    public int PromptTokens { get; private set; }
    public int CompletionTokens { get; private set; }

    private AIResponse() { } // EF Core

    public AIResponse(Guid mathRequestId)
    {
        MathRequestId = mathRequestId;
    }

    public void AppendContent(string chunk)
    {
        ResponseJson += chunk;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateTokenUsage(int promptTokens, int completionTokens)
    {
        PromptTokens = promptTokens;
        CompletionTokens = completionTokens;
        UpdatedAt = DateTime.UtcNow;
    }
}
