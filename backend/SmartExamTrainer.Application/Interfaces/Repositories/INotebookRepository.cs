using SmartExamTrainer.Domain.Entities;

namespace SmartExamTrainer.Application.Interfaces.Repositories;

public interface INotebookRepository
{
    Task AddAsync(NotebookEntry entry, CancellationToken cancellationToken = default);
    void Update(NotebookEntry entry);
    Task<NotebookEntry?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<NotebookEntry?> GetByMathRequestIdAsync(Guid userId, Guid mathRequestId, CancellationToken cancellationToken = default);
    Task<List<NotebookEntry>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    void Remove(NotebookEntry entry);
}
