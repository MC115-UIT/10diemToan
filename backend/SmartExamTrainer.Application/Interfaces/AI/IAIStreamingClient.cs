namespace SmartExamTrainer.Application.Interfaces.AI;

public interface IAIStreamingClient
{
    IAsyncEnumerable<string> StreamTextAsync(string prompt, string? imageBase64 = null, CancellationToken cancellationToken = default);
}
