using SmartExamTrainer.Domain.Common;

namespace SmartExamTrainer.Domain.Entities;

public class MathRequest : BaseEntity
{
    public Guid ConversationId { get; private set; }
    public Conversation Conversation { get; private set; } = null!;

    public string Content { get; private set; } = string.Empty;
    public string? ImageBase64 { get; private set; }
    public string LatexContent { get; private set; } = string.Empty;
    public string Status { get; private set; } = "Pending"; // Pending, Processing, Completed, Failed

    public AIResponse? Response { get; private set; }

    private MathRequest() { } // EF Core

    public MathRequest(Guid conversationId, string content, string? imageBase64 = null)
    {
        ConversationId = conversationId;
        Content = content;
        ImageBase64 = imageBase64;
    }

    public void MarkAsProcessing()
    {
        Status = "Processing";
        UpdatedAt = DateTime.UtcNow;
    }

    public void MarkAsCompleted()
    {
        Status = "Completed";
        UpdatedAt = DateTime.UtcNow;
    }
    
    public void MarkAsFailed()
    {
        Status = "Failed";
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetResponse(AIResponse response)
    {
        Response = response;
    }
}
