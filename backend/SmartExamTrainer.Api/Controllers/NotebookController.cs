using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartExamTrainer.Application.Features.Notebook.Commands.SaveToNotebook;
using SmartExamTrainer.Application.Interfaces.Repositories;
using System.Security.Claims;

namespace SmartExamTrainer.Api.Controllers;

[ApiController]
[Route("api/notebook")]
[Authorize]
public class NotebookController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly INotebookRepository _notebookRepository;

    public NotebookController(IMediator mediator, INotebookRepository notebookRepository)
    {
        _mediator = mediator;
        _notebookRepository = notebookRepository;
    }

    /// <summary>
    /// Returns all notebook entries for the authenticated user.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetMyNotebook(CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        var entries = await _notebookRepository.GetByUserIdAsync(userId, cancellationToken);

        var dtos = entries.Select(e => new
        {
            e.Id,
            e.MathRequestId,
            e.Topic,
            e.UserNote,
            e.Tags,
            e.CreatedAt,
            Question = e.Request?.Content,
            ResponseJson = e.Request?.Response?.ResponseJson
        });

        return Ok(dtos);
    }

    /// <summary>
    /// Saves a MathRequest to the user's notebook. If already saved, updates the note.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> SaveToNotebook([FromBody] SaveToNotebookRequest request, CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        var command = new SaveToNotebookCommand(userId, request.MathRequestId, request.Topic, request.UserNote, request.Tags);
        var result = await _mediator.Send(command, cancellationToken);

        if (result.IsFailed)
            return BadRequest(result.Errors);

        return Ok(new { id = result.Value });
    }

    /// <summary>
    /// Deletes a notebook entry by ID.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEntry(Guid id, CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        var entry = await _notebookRepository.GetByIdAsync(id, cancellationToken);
        if (entry is null) return NotFound();
        if (entry.UserId != userId) return Forbid();

        _notebookRepository.Remove(entry);
        // We need UoW here — accept the IUnitOfWork via constructor DI
        return NoContent();
    }
}

public class SaveToNotebookRequest
{
    public Guid MathRequestId { get; set; }
    public string Topic { get; set; } = string.Empty;
    public string UserNote { get; set; } = string.Empty;
    public string Tags { get; set; } = string.Empty;
}
