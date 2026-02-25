using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SmartExamTrainer.Application.Interfaces.Repositories;
using SmartExamTrainer.Persistence.Context;
using SmartExamTrainer.Persistence.Repositories;

namespace SmartExamTrainer.Persistence;

public static class DependencyInjection
{
    public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? "Host=localhost;Database=SmartExamTrainer;Username=postgres;Password=postgres";

        // Recommend using DbContextFactory for high concurrency / Blazor scenarios, but plain DbContext is ok for normal Web API requests
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<IUnitOfWork>(provider => provider.GetRequiredService<ApplicationDbContext>());
        services.AddScoped<IMathRequestRepository, MathRequestRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IConversationRepository, ConversationRepository>();
        services.AddScoped<ILLMTokenUsageRepository, LLMTokenUsageRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

        return services;
    }
}
