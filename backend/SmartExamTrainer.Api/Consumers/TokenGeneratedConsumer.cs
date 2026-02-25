using MassTransit;
using SmartExamTrainer.Api.Services;
using SmartExamTrainer.Domain.Events;

namespace SmartExamTrainer.Api.Consumers;

public class TokenGeneratedConsumer : IConsumer<TokenGeneratedEvent>
{
    private readonly SseTokenBridge _bridge;

    public TokenGeneratedConsumer(SseTokenBridge bridge)
    {
        _bridge = bridge;
    }

    public async Task Consume(ConsumeContext<TokenGeneratedEvent> context)
    {
        await _bridge.PushTokenAsync(context.Message);
    }
}
