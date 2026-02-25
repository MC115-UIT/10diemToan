using Microsoft.EntityFrameworkCore;
using SmartExamTrainer.Application.Interfaces.Repositories;
using SmartExamTrainer.Domain.Entities;

namespace SmartExamTrainer.Persistence.Context;

public class ApplicationDbContext : DbContext, IUnitOfWork
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<MathRequest> MathRequests => Set<MathRequest>();
    public DbSet<AIResponse> AIResponses => Set<AIResponse>();
    public DbSet<LLMTokenUsage> LLMTokenUsages => Set<LLMTokenUsage>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Simple entity map config
        modelBuilder.Entity<MathRequest>()
            .HasOne(m => m.Conversation)
            .WithMany(c => c.Requests)
            .HasForeignKey(m => m.ConversationId);

        modelBuilder.Entity<AIResponse>()
            .HasOne(a => a.Request)
            .WithOne(m => m.Response)
            .HasForeignKey<AIResponse>(a => a.MathRequestId);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Could dispatch domain events here
        return await base.SaveChangesAsync(cancellationToken);
    }
}
