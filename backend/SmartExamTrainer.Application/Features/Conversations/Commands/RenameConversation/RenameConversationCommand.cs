using FluentResults;
using SmartExamTrainer.Shared.CQRS;

namespace SmartExamTrainer.Application.Features.Conversations.Commands.RenameConversation;

public record RenameConversationCommand(Guid ConversationId, Guid UserId, string NewTitle) : ICommand;
