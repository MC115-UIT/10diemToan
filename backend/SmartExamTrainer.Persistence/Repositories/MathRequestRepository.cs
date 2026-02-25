using Microsoft.EntityFrameworkCore;
using SmartExamTrainer.Application.Interfaces.Repositories;
using SmartExamTrainer.Domain.Entities;
using SmartExamTrainer.Persistence.Context;

namespace SmartExamTrainer.Persistence.Repositories;

public class MathRequestRepository : IMathRequestRepository
{
    private readonly ApplicationDbContext _context;

    public MathRequestRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(MathRequest request, CancellationToken cancellationToken = default)
    {
        await _context.MathRequests.AddAsync(request, cancellationToken);
    }

    public async Task<MathRequest?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.MathRequests.FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
    }

    public void Update(MathRequest request)
    {
        _context.MathRequests.Update(request);
    }
}
