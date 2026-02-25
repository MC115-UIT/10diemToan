using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartExamTrainer.Application.Interfaces.Repositories;
using SmartExamTrainer.Domain.Entities;
using System.Security.Claims;

namespace SmartExamTrainer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ConversationsController : ControllerBase
{
    private readonly IConversationRepository _conversationRepository;

    public ConversationsController(IConversationRepository conversationRepository)
    {
        _conversationRepository = conversationRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyConversations(CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        var conversations = await _conversationRepository.GetByUserIdAsync(userId, cancellationToken);
        
        var dtos = conversations.Select(c => new
        {
            c.Id,
            c.Title,
            c.CreatedAt,
            c.UpdatedAt
        });

        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetConversationHistory(Guid id, CancellationToken cancellationToken)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId))
            return Unauthorized();

        var conversation = await _conversationRepository.GetWithHistoryAsync(id, cancellationToken);

        if (conversation == null) return NotFound();
        if (conversation.UserId != userId) return Forbid();

        var dto = new
        {
            conversation.Id,
            conversation.Title,
            conversation.CreatedAt,
            Requests = conversation.Requests.Select(r => new
            {
                r.Id,
                r.Content,
                r.LatexContent,
                r.Status,
                r.CreatedAt,
                Response = r.Response != null ? new
                {
                    r.Response.Id,
                    r.Response.ResponseJson,
                    r.Response.PromptTokens,
                    r.Response.CompletionTokens,
                    r.Response.CreatedAt
                } : null
            })
        };

        return Ok(dto);
    }
}
