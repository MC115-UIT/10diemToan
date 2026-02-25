using MediatR;
using Microsoft.AspNetCore.Mvc;
using SmartExamTrainer.Api.Services;
using SmartExamTrainer.Application.Features.Math.Commands.SolveMathProblem;
using System.Text;

namespace SmartExamTrainer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MathController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly SseTokenBridge _sseBridge;

    public MathController(IMediator mediator, SseTokenBridge sseBridge)
    {
        _mediator = mediator;
        _sseBridge = sseBridge;
    }

    [HttpPost("solve")]
    public async Task<IActionResult> Solve([FromBody] SolveMathProblemCommand command)
    {
        var result = await _mediator.Send(command);

        if (result.IsFailed)
        {
            return BadRequest(result.Errors);
        }

        return Accepted(result.Value);
    }

    [HttpGet("stream/{correlationId}")]
    public async Task Stream(Guid correlationId, CancellationToken cancellationToken)
    {
        Response.Headers.Append("Content-Type", "text/event-stream");
        Response.Headers.Append("Cache-Control", "no-cache");
        Response.Headers.Append("Connection", "keep-alive");

        var reader = _sseBridge.Subscribe(correlationId);

        await foreach (var tokenEvent in reader.ReadAllAsync(cancellationToken))
        {
            if (tokenEvent.IsCompleted)
            {
                var completionData = $"data: [DONE]\n\n";
                await Response.Body.WriteAsync(Encoding.UTF8.GetBytes(completionData), cancellationToken);
                await Response.Body.FlushAsync(cancellationToken);
                break;
            }

            // Replace newlines with spaces or properly format for SSE data payload
            var sanitizedToken = tokenEvent.Token.Replace("\n", "\\n");
            var data = $"data: {sanitizedToken}\n\n";

            await Response.Body.WriteAsync(Encoding.UTF8.GetBytes(data), cancellationToken);
            await Response.Body.FlushAsync(cancellationToken);
        }
    }
}
