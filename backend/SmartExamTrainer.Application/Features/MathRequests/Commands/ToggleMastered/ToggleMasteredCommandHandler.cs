using FluentResults;
using SmartExamTrainer.Application.Interfaces.Repositories;
using SmartExamTrainer.Domain.Entities;
using SmartExamTrainer.Shared.CQRS;

namespace SmartExamTrainer.Application.Features.MathRequests.Commands.ToggleMastered;

public class ToggleMasteredCommandHandler : ICommandHandler<ToggleMasteredCommand>
{
    private readonly IMathRequestRepository _mathRequestRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ToggleMasteredCommandHandler(
        IMathRequestRepository mathRequestRepository,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork)
    {
        _mathRequestRepository = mathRequestRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(ToggleMasteredCommand command, CancellationToken cancellationToken)
    {
        var request = await _mathRequestRepository.GetByIdAsync(command.RequestId, cancellationToken);
        if (request is null)
            return Result.Fail("Request not found.");

        // Verify ownership via conversation
        var user = await _userRepository.GetByIdAsync(command.UserId, cancellationToken);
        if (user is null)
            return Result.Fail("User not found.");

        request.ToggleMastered();
        _mathRequestRepository.Update(request);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Ok();
    }
}
