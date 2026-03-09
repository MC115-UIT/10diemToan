using FluentResults;
using SmartExamTrainer.Application.Interfaces.Repositories;
using SmartExamTrainer.Shared.CQRS;

namespace SmartExamTrainer.Application.Features.Conversations.Commands.RenameConversation;

public class RenameConversationCommandHandler : ICommandHandler<RenameConversationCommand>
{
    private readonly IConversationRepository _conversationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RenameConversationCommandHandler(IConversationRepository conversationRepository, IUnitOfWork unitOfWork)
    {
        _conversationRepository = conversationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(RenameConversationCommand request, CancellationToken cancellationToken)
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

        if (string.IsNullOrWhiteSpace(request.NewTitle))
        {
            return Result.Fail("Title cannot be empty.");
        }

        conversation.Rename(request.NewTitle);
        _conversationRepository.Update(conversation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Ok();
    }
}
