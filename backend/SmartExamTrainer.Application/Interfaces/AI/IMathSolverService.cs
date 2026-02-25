namespace SmartExamTrainer.Application.Interfaces.AI;

public interface IMathSolverService
{
    IAsyncEnumerable<string> SolveAsync(string requestContent, string? imageBase64 = null, CancellationToken cancellationToken = default);
}
