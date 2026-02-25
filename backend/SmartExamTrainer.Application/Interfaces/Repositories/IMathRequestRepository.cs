using SmartExamTrainer.Domain.Entities;

namespace SmartExamTrainer.Application.Interfaces.Repositories;

public interface IMathRequestRepository
{
    Task<MathRequest?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(MathRequest request, CancellationToken cancellationToken = default);
    void Update(MathRequest request);
}
