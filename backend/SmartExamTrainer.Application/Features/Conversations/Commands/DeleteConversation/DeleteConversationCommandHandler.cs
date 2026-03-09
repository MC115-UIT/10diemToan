using FluentResults;
using SmartExamTrainer.Application.Interfaces.Repositories;
using SmartExamTrainer.Shared.CQRS;

namespace SmartExamTrainer.Application.Features.Conversations.Commands.DeleteConversation;

public class DeleteConversationCommandHandler : ICommandHandler<DeleteConversationCommand>
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteConversationCommandHandler(IConversationRepository conversationRepository, IUnitOfWork unitOfWork)
    {
        _conversationRepository = conversationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteConversationCommand request, CancellationToken cancellationToken)
    {
        var conversation = await _conversationRepository.GetByIdAsync(request.ConversationId, cancellationToken);
        
        if (conversation == null)
        {
            return Result.Fail("Conversation not found.");
        }

        if (conversation.UserId != request.UserId)
        {
            return Result.Fail("Unauthorized to access this conversation.");
        }

        _conversationRepository.Remove(conversation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Ok();
    }
}
