using SmartExamTrainer.Domain.Common;

namespace SmartExamTrainer.Domain.Entities;

public class Conversation : BaseEntity
{
    public Guid UserId { get; private set; }
    public string Title { get; private set; } = string.Empty;

    public ICollection<MathRequest> Requests { get; private set; } = new List<MathRequest>();

    private Conversation() { } // EF Core

    public Conversation(Guid userId, string title)
    {
        UserId = userId;
        Title = title;
    }
}
