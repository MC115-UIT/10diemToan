using SmartExamTrainer.Shared.CQRS;

namespace SmartExamTrainer.Application.Features.Notebook.Commands.SaveToNotebook;

public record SaveToNotebookCommand(
    Guid UserId,
    Guid MathRequestId,
    string Topic,
    string UserNote,
    string Tags
) : ICommand<Guid>;
