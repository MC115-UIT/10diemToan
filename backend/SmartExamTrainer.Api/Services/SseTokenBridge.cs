using System.Collections.Concurrent;
using System.Threading.Channels;
using SmartExamTrainer.Domain.Events;

namespace SmartExamTrainer.Api.Services;

public class SseTokenBridge
{
    // Map CorrelationId -> List of active subscriber channels
    private readonly ConcurrentDictionary<Guid, ConcurrentBag<Channel<TokenGeneratedEvent>>> _subscribers = new();
    // Map CorrelationId -> List of tokens generated so far for replay
    private readonly ConcurrentDictionary<Guid, List<TokenGeneratedEvent>> _history = new();

    public ChannelReader<TokenGeneratedEvent> Subscribe(Guid correlationId)
    {
        var channel = Channel.CreateUnbounded<TokenGeneratedEvent>();
        bool isCompleted = false;
        
        // 1. Replay history to this new subscriber
        if (_history.TryGetValue(correlationId, out var history))
        {
            lock (history)
            {
                foreach (var tokenEvent in history)
                {
                    channel.Writer.TryWrite(tokenEvent);
                    if (tokenEvent.IsCompleted)
                    {
                        isCompleted = true;
                    }
                }
            }
        }

        if (isCompleted)
        {
            channel.Writer.TryComplete();
            return channel.Reader;
        }

        // 2. Register for future tokens if not completed
        var subs = _subscribers.GetOrAdd(correlationId, _ => new ConcurrentBag<Channel<TokenGeneratedEvent>>());
        subs.Add(channel);
        
        return channel.Reader;
    }

    public async Task PushTokenAsync(TokenGeneratedEvent @event)
    {
        // 1. Add to history for future subscribers
        var history = _history.GetOrAdd(@event.CorrelationId, _ => new List<TokenGeneratedEvent>());
        lock (history)
        {
            history.Add(@event);
        }

        // 2. Broadcast to all active subscribers
        if (_subscribers.TryGetValue(@event.CorrelationId, out var subs))
        {
            foreach (var channel in subs)
            {
                await channel.Writer.WriteAsync(@event);
            }
        }

        // 3. Cleanup on completion
        if (@event.IsCompleted)
        {
            if (_subscribers.TryRemove(@event.CorrelationId, out var finalSubs))
            {
                foreach (var channel in finalSubs)
                {
                    channel.Writer.TryComplete();
                }
            }
            
            // Delay history cleanup by 2 minutes so late subscribers can still replay the full text
            _ = Task.Delay(TimeSpan.FromMinutes(2)).ContinueWith(_task =>
            {
                _history.TryRemove(@event.CorrelationId, out _);
            });
        }
    }
}
