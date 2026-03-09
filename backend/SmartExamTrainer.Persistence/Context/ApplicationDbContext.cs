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
    public DbSet<NotebookEntry> NotebookEntries => Set<NotebookEntry>();

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

        modelBuilder.Entity<NotebookEntry>()
            .HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<NotebookEntry>()
            .HasOne(n => n.Request)
            .WithMany()
            .HasForeignKey(n => n.MathRequestId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<NotebookEntry>()
            .HasIndex(n => new { n.UserId, n.MathRequestId })
            .IsUnique();
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Could dispatch domain events here
        return await base.SaveChangesAsync(cancellationToken);
    }
}
