using System.Collections.Concurrent;
using System.Threading.Channels;
using SmartExamTrainer.Domain.Events;

namespace SmartExamTrainer.Api.Services;

public class SseTokenBridge
{
    private readonly ConcurrentDictionary<Guid, Channel<TokenGeneratedEvent>> _channels = new();

    public ChannelReader<TokenGeneratedEvent> Subscribe(Guid correlationId)
    {
        var channel = _channels.GetOrAdd(correlationId, _ => Channel.CreateUnbounded<TokenGeneratedEvent>());
        return channel.Reader;
    }

    public async Task PushTokenAsync(TokenGeneratedEvent @event)
    {
        if (_channels.TryGetValue(@event.CorrelationId, out var channel))
        {
            await channel.Writer.WriteAsync(@event);
            if (@event.IsCompleted)
            {
                channel.Writer.Complete();
                _channels.TryRemove(@event.CorrelationId, out _);
            }
        }
    }
}
