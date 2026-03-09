using Microsoft.EntityFrameworkCore;
using SmartExamTrainer.Application.Interfaces.Repositories;
using SmartExamTrainer.Domain.Entities;
using SmartExamTrainer.Persistence.Context;

namespace SmartExamTrainer.Persistence.Repositories;

public class NotebookRepository : INotebookRepository
{
    private readonly ApplicationDbContext _context;

    public NotebookRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(NotebookEntry entry, CancellationToken cancellationToken = default)
    {
        await _context.NotebookEntries.AddAsync(entry, cancellationToken);
    }

    public void Update(NotebookEntry entry)
    {
        _context.NotebookEntries.Update(entry);
    }

    public async Task<NotebookEntry?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.NotebookEntries.FirstOrDefaultAsync(n => n.Id == id, cancellationToken);
    }

    public async Task<NotebookEntry?> GetByMathRequestIdAsync(Guid userId, Guid mathRequestId, CancellationToken cancellationToken = default)
    {
        return await _context.NotebookEntries
            .FirstOrDefaultAsync(n => n.UserId == userId && n.MathRequestId == mathRequestId, cancellationToken);
    }

    public async Task<List<NotebookEntry>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.NotebookEntries
            .Where(n => n.UserId == userId)
            .Include(n => n.Request)
                .ThenInclude(r => r.Response)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public void Remove(NotebookEntry entry)
    {
        _context.NotebookEntries.Remove(entry);
    }
}
