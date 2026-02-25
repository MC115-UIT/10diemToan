using FluentResults;
using FluentValidation;
using MediatR;

namespace SmartExamTrainer.Application.Behaviors;

public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
    where TResponse : class
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        if (!_validators.Any())
            return await next();

        var context = new ValidationContext<TRequest>(request);

        var validationResults = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        var failures = validationResults
            .Where(r => r.Errors.Any())
            .SelectMany(r => r.Errors)
            .ToList();

        if (failures.Count > 0)
        {
            var resultType = typeof(TResponse);
            
            // Assuming TResponse is a Result or Result<T> from FluentResults
            if (resultType.IsGenericType && resultType.GetGenericTypeDefinition() == typeof(Result<>))
            {
                var result = Activator.CreateInstance(resultType);
                var withErrorsMethod = resultType.GetMethod("WithErrors", new[] { typeof(IEnumerable<IError>) });
                
                var errors = failures.Select(f => new Error(f.ErrorMessage).WithMetadata("PropertyName", f.PropertyName));
                withErrorsMethod?.Invoke(result, new object[] { errors });
                return (TResponse)result!;
            }
            
            if (resultType == typeof(Result))
            {
                var errors = failures.Select(f => new Error(f.ErrorMessage).WithMetadata("PropertyName", f.PropertyName));
                return (TResponse)(object)Result.Fail(errors);
            }

            throw new ValidationException(failures);
        }

        return await next();
    }
}
