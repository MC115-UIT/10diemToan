using FluentResults;
using MediatR;

namespace SmartExamTrainer.Shared.CQRS;

public interface ICommand<TResponse> : IRequest<Result<TResponse>>
{
}

public interface ICommand : IRequest<Result>
{
}
