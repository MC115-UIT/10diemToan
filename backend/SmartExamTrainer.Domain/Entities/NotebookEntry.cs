using SmartExamTrainer.Domain.Common;

namespace SmartExamTrainer.Domain.Entities;

public class NotebookEntry : BaseEntity
{
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;

    public Guid MathRequestId { get; private set; }
    public MathRequest Request { get; private set; } = null!;

    public string Topic { get; private set; } = string.Empty;
    public string UserNote { get; private set; } = string.Empty;
    public string Tags { get; private set; } = string.Empty;

    private NotebookEntry() { } // EF Core

    public NotebookEntry(Guid userId, Guid mathRequestId, string topic, string userNote = "", string tags = "")
    {
        UserId = userId;
        MathRequestId = mathRequestId;
        Topic = topic;
        UserNote = userNote;
        Tags = tags;
    }

    public void Update(string topic, string userNote, string tags)
    {
        Topic = topic;
        UserNote = userNote;
        Tags = tags;
        UpdatedAt = DateTime.UtcNow;
    }
}
