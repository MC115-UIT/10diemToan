using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartExamTrainer.Application.Features.MathRequests.Commands.ToggleMastered;
using System.Security.Claims;

namespace SmartExamTrainer.Api.Controllers;

[ApiController]
[Route("api/math-requests")]
[Authorize]
public class MathRequestsController : ControllerBase
{
    private readonly IMediator _mediator;

    public MathRequestsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Toggles the "mastered" flag on a MathRequest.
    /// Action Bar — "Đánh dấu đã nắm" button.
    /// </summary>
    [HttpPut("{id}/mastered")]
    public async Task<IActionResult> ToggleMastered(Guid id, CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        var command = new ToggleMasteredCommand(id, userId);
        var result = await _mediator.Send(command, cancellationToken);

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return Ok();
    }
}
