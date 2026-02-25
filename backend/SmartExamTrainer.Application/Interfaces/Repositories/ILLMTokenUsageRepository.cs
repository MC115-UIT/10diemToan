using SmartExamTrainer.Domain.Entities;

namespace SmartExamTrainer.Application.Interfaces.Repositories;

public interface ILLMTokenUsageRepository
{
    Task<int> GetDailyTokensUsedAsync(Guid userId, DateTime date, CancellationToken cancellationToken = default);
    Task AddUsageAsync(LLMTokenUsage usage, CancellationToken cancellationToken = default);
}
