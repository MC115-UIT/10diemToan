using FluentResults;
using SmartExamTrainer.Application.Interfaces.Repositories;
using SmartExamTrainer.Domain.Entities;
using SmartExamTrainer.Domain.Events;
using SmartExamTrainer.Shared.CQRS;
using SmartExamTrainer.Shared.Events;

namespace SmartExamTrainer.Application.Features.Math.Commands.SolveMathProblem;

public class SolveMathProblemCommandHandler : ICommandHandler<SolveMathProblemCommand, SolveMathProblemResponse>
{
    private readonly IMathRequestRepository _mathRequestRepository;
    private readonly ILLMTokenUsageRepository _llmTokenUsageRepository;
    private readonly IUserRepository _userRepository;
    private readonly IConversationRepository _conversationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEventBus _eventBus;

    public SolveMathProblemCommandHandler(
        IMathRequestRepository mathRequestRepository,
        ILLMTokenUsageRepository llmTokenUsageRepository,
        IUserRepository userRepository,
        IConversationRepository conversationRepository,
        IUnitOfWork unitOfWork,
        IEventBus eventBus)
    {
        _mathRequestRepository = mathRequestRepository;
        _llmTokenUsageRepository = llmTokenUsageRepository;
        _userRepository = userRepository;
        _conversationRepository = conversationRepository;
        _unitOfWork = unitOfWork;
        _eventBus = eventBus;
    }

    public async Task<Result<SolveMathProblemResponse>> Handle(SolveMathProblemCommand request, CancellationToken cancellationToken)
    {
        // 1. LLM Gate Check
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null) return Result.Fail("User not found.");

        if (!user.IsPremium)
        {
            var dailyTokens = await _llmTokenUsageRepository.GetDailyTokensUsedAsync(user.Id, DateTime.UtcNow.Date, cancellationToken);
            var freeTierDailyLimit = 10000;

            if (dailyTokens >= freeTierDailyLimit)
            {
                return Result.Fail("Daily free token limit reached. Please upgrade to Premium or try again tomorrow.");
            }
        }

        // 2. Resolve Conversation
        var conversationId = request.ConversationId;
        if (conversationId == Guid.Empty)
        {
            var newConversation = new Conversation(user.Id, "New Math Problem");
            await _conversationRepository.AddAsync(newConversation, cancellationToken);
            conversationId = newConversation.Id;
        }

        // 3. Create MathRequest Entity
        var mathRequest = new MathRequest(conversationId, request.Content, request.ImageBase64);

        // Save to DB
        await _mathRequestRepository.AddAsync(mathRequest, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Publish Event for worker to pick up
        var correlationId = Guid.NewGuid(); // Or use a proper CorrelationID provider
        var submittedEvent = new MathProblemSubmittedEvent(
            correlationId, 
            mathRequest.Id, 
            request.UserId, 
            mathRequest.Content, 
            request.ImageBase64);
        
        await _eventBus.PublishAsync(submittedEvent, cancellationToken);

        return Result.Ok(new SolveMathProblemResponse(mathRequest.Id, conversationId));
    }
}

public record SolveMathProblemResponse(Guid MathRequestId, Guid ConversationId);
