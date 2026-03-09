using FluentResults;
using SmartExamTrainer.Application.Interfaces.Repositories;
using SmartExamTrainer.Domain.Entities;
using SmartExamTrainer.Shared.CQRS;

namespace SmartExamTrainer.Application.Features.Notebook.Commands.SaveToNotebook;

public class SaveToNotebookCommandHandler : ICommandHandler<SaveToNotebookCommand, Guid>
{
    private readonly INotebookRepository _notebookRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SaveToNotebookCommandHandler(INotebookRepository notebookRepository, IUnitOfWork unitOfWork)
    {
        _notebookRepository = notebookRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(SaveToNotebookCommand command, CancellationToken cancellationToken)
    {
        // Check if this request is already saved
        var existing = await _notebookRepository.GetByMathRequestIdAsync(command.UserId, command.MathRequestId, cancellationToken);
        if (existing is not null)
        {
            // Update the existing entry instead
            existing.Update(command.Topic, command.UserNote, command.Tags);
            _notebookRepository.Update(existing);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Ok(existing.Id);
        }

        var entry = new NotebookEntry(
            command.UserId,
            command.MathRequestId,
            command.Topic,
            command.UserNote,
            command.Tags
        );

        await _notebookRepository.AddAsync(entry, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Ok(entry.Id);
    }
}
