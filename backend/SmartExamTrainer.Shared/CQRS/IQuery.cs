using FluentResults;
using MediatR;

namespace SmartExamTrainer.Shared.CQRS;

public interface IQuery<TResponse> : IRequest<Result<TResponse>>
{
}
