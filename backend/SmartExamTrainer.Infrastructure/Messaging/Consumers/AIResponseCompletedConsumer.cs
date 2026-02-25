using MassTransit;
using SmartExamTrainer.Application.Interfaces.Repositories;
using SmartExamTrainer.Domain.Entities;
using SmartExamTrainer.Domain.Events;

namespace SmartExamTrainer.Infrastructure.Messaging.Consumers;

public class AIResponseCompletedConsumer : IConsumer<AIResponseCompletedEvent>
{
    private readonly ILLMTokenUsageRepository _tokenTracker;
    private readonly IMathRequestRepository _mathRequestRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AIResponseCompletedConsumer(
        ILLMTokenUsageRepository tokenTracker,
        IMathRequestRepository mathRequestRepository, 
        IUnitOfWork unitOfWork)
    {
        _tokenTracker = tokenTracker;
        _mathRequestRepository = mathRequestRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Consume(ConsumeContext<AIResponseCompletedEvent> context)
    {
        var e = context.Message;

        // 1. Update AIResponse entity
        var request = await _mathRequestRepository.GetByIdAsync(e.MathRequestId, context.CancellationToken);
        if (request != null)
        {
            var response = new AIResponse(request.Id);
            response.AppendContent(e.FinalResponseJson);
            response.UpdateTokenUsage(e.PromptTokens, e.CompletionTokens);
            
            request.MarkAsCompleted();
            request.SetResponse(response);
        }

        // 2. Add Token Usage Record
        int totalTokens = e.PromptTokens + e.CompletionTokens; // Basic
        var tokenUsage = new LLMTokenUsage(e.UserId, totalTokens);
        
        await _tokenTracker.AddUsageAsync(tokenUsage, context.CancellationToken);

        // Save Transaction
        await _unitOfWork.SaveChangesAsync(context.CancellationToken);
    }
}
