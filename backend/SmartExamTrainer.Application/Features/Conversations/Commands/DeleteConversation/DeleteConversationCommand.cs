using FluentResults;
using SmartExamTrainer.Shared.CQRS;

namespace SmartExamTrainer.Application.Features.Conversations.Commands.DeleteConversation;

public record DeleteConversationCommand(Guid ConversationId, Guid UserId) : ICommand;
