using MassTransit;
using SmartExamTrainer.Application.Interfaces.AI;
using SmartExamTrainer.Domain.Events;
using SmartExamTrainer.Shared.Events;

namespace SmartExamTrainer.Infrastructure.Messaging.Consumers;

public class MathProblemSubmittedConsumer : IConsumer<MathProblemSubmittedEvent>
{
    private readonly IMathSolverService _mathSolverService;
    private readonly IEventBus _eventBus; // used to stream tokens back to API listeners if applicable

    public MathProblemSubmittedConsumer(IMathSolverService mathSolverService, IEventBus eventBus)
    {
        _mathSolverService = mathSolverService;
        _eventBus = eventBus;
    }

    public async Task Consume(ConsumeContext<MathProblemSubmittedEvent> context)
    {
        var message = context.Message;
        var fullResponseBuilder = new System.Text.StringBuilder();
        int estimatedPromptTokens = message.MathContent.Length / 4; // naive estimation
        int completionTokens = 0;
        
        // Example: We start receiving tokens and push them out so the API SSE endpoint can stream them
        await foreach(var token in _mathSolverService.SolveAsync(message.MathContent, message.ImageBase64, context.CancellationToken))
        {
            fullResponseBuilder.Append(token);
            completionTokens += token.Length / 4; // naive estimation per chunk

            await _eventBus.PublishAsync(new TokenGeneratedEvent(message.CorrelationId, token), context.CancellationToken);
        }

        // Send completion signal for SSE stream
        await _eventBus.PublishAsync(new TokenGeneratedEvent(message.CorrelationId, "", isCompleted: true), context.CancellationToken);

        // Send Domain Event to record database token usage and response saving
        var completedEvent = new AIResponseCompletedEvent(
            message.MathRequestId,
            message.UserId,
            estimatedPromptTokens,
            completionTokens,
            fullResponseBuilder.ToString()
        );

        await _eventBus.PublishAsync(completedEvent, context.CancellationToken);
    }
}
