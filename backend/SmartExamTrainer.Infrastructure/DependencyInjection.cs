using MassTransit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SmartExamTrainer.Application.Interfaces.AI;
using SmartExamTrainer.Infrastructure.AI;
using SmartExamTrainer.Infrastructure.Messaging;
using SmartExamTrainer.Infrastructure.Messaging.Consumers;
using SmartExamTrainer.Shared.Events;

namespace SmartExamTrainer.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Auth Services
        services.AddScoped<SmartExamTrainer.Application.Interfaces.Auth.IAuthService, SmartExamTrainer.Infrastructure.Auth.AuthService>();

        // AI Services
        services.AddHttpClient<IAIStreamingClient, GeminiStreamingClient>();
        services.AddScoped<IMathSolverService, MathSolverService>();

        // Messaging
        services.AddScoped<IEventBus, EventBus>();

        services.AddMassTransit(x =>
        {
            x.AddConsumer<MathProblemSubmittedConsumer>();
            x.AddConsumer<AIResponseCompletedConsumer>();

            // Automatically register consumers from the executing API project
            x.AddConsumers(System.Reflection.Assembly.GetEntryAssembly());

            x.UsingRabbitMq((context, cfg) =>
            {
                // Fallback to localhost if no config provided for testing
                cfg.Host(configuration["RabbitMQ:Host"] ?? "localhost", "/", h =>
                {
                    h.Username(configuration["RabbitMQ:Username"] ?? "guest");
                    h.Password(configuration["RabbitMQ:Password"] ?? "guest");
                });

                cfg.ConfigureEndpoints(context);
            });
        });

        return services;
    }
}
