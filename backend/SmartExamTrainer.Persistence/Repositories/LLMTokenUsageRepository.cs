using Microsoft.EntityFrameworkCore;
using SmartExamTrainer.Application.Interfaces.Repositories;
using SmartExamTrainer.Domain.Entities;
using SmartExamTrainer.Persistence.Context;

namespace SmartExamTrainer.Persistence.Repositories;

public class LLMTokenUsageRepository : ILLMTokenUsageRepository
{
    private readonly ApplicationDbContext _context;

    public LLMTokenUsageRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddUsageAsync(LLMTokenUsage usage, CancellationToken cancellationToken = default)
    {
        var existingRecord = await _context.LLMTokenUsages
            .FirstOrDefaultAsync(u => u.UserId == usage.UserId && u.Date == usage.Date && u.OperationType == usage.OperationType, cancellationToken);

        if (existingRecord != null)
        {
            existingRecord.AddTokens(usage.TokensUsed);
        }
        else
        {
             await _context.LLMTokenUsages.AddAsync(usage, cancellationToken);
        }
    }

    public async Task<int> GetDailyTokensUsedAsync(Guid userId, DateTime date, CancellationToken cancellationToken = default)
    {
        return await _context.LLMTokenUsages
            .Where(u => u.UserId == userId && u.Date == date.Date)
            .SumAsync(u => u.TokensUsed, cancellationToken);
    }
}
