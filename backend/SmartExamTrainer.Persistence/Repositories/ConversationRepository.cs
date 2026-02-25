using Microsoft.EntityFrameworkCore;
using SmartExamTrainer.Application.Interfaces.Repositories;
using SmartExamTrainer.Domain.Entities;
using SmartExamTrainer.Persistence.Context;

namespace SmartExamTrainer.Persistence.Repositories;

public class ConversationRepository : IConversationRepository
{
    private readonly ApplicationDbContext _context;

    public ConversationRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Conversation conversation, CancellationToken cancellationToken = default)
    {
        await _context.Conversations.AddAsync(conversation, cancellationToken);
    }

    public async Task<Conversation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Conversations.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Conversation>> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Conversations
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Conversation?> GetWithHistoryAsync(Guid id, CancellationToken cancellationToken = default)
    {
        // Eager load MathRequests and their AIResponses
        return await _context.Conversations
            .Include(c => c.Requests.OrderBy(r => r.CreatedAt))
            .ThenInclude(r => r.Response)
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }
}
