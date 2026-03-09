namespace SmartExamTrainer.Application.Interfaces.AI;

public interface IMathSolverService
{
    IAsyncEnumerable<string> SolveAsync(string requestContent, string? imageBase64 = null, int grade = 0, string targetExams = "", int selfAssessmentLevel = 0, CancellationToken cancellationToken = default);
}
