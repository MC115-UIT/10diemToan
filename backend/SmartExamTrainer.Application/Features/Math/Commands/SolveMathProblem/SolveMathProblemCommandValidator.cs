using FluentValidation;

namespace SmartExamTrainer.Application.Features.Math.Commands.SolveMathProblem;

public class SolveMathProblemCommandValidator : AbstractValidator<SolveMathProblemCommand>
{
    public SolveMathProblemCommandValidator()
    {
        RuleFor(x => x.ConversationId)
            .NotEmpty().WithMessage("ConversationId is required.");

        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Math problem content is required.")
            .MaximumLength(2000).WithMessage("Math problem content is too long.");
    }
}
