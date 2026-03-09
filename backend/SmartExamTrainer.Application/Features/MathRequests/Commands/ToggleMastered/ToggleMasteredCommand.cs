using SmartExamTrainer.Shared.CQRS;

namespace SmartExamTrainer.Application.Features.MathRequests.Commands.ToggleMastered;

public record ToggleMasteredCommand(Guid RequestId, Guid UserId) : ICommand;
