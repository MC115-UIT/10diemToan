using SmartExamTrainer.Shared.CQRS;

namespace SmartExamTrainer.Application.Features.Math.Commands.SolveMathProblem;

public class SolveMathProblemCommand : ICommand<SolveMathProblemResponse>
{
    public Guid ConversationId { get; set; }
    public Guid UserId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? ImageBase64 { get; set; }
}
