using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartExamTrainer.Application.Interfaces.Repositories;

namespace SmartExamTrainer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UserController(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    [HttpPost("onboard")]
    public async Task<IActionResult> CompleteOnboarding([FromBody] OnboardingRequest request, CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null || !Guid.TryParse(userId, out var guid)) return Unauthorized();

        var user = await _userRepository.GetByIdAsync(guid, cancellationToken);
        if (user == null) return NotFound("User not found.");

        user.CompleteOnboarding(request.Grade, request.TargetExams, request.SelfAssessmentLevel);
        
        _userRepository.Update(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Ok(new { message = "Onboarding completed successfully" });
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMe(CancellationToken cancellationToken)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null || !Guid.TryParse(userId, out var guid)) return Unauthorized();

        var user = await _userRepository.GetByIdAsync(guid, cancellationToken);
        if (user == null) return NotFound("User not found.");

        return Ok(new
        {
            user = new 
            { 
                Id = user.Id, 
                Email = user.Email, 
                Role = user.Role,
                FullName = user.FullName,
                IsPremium = user.IsPremium,
                IsOnboarded = user.IsOnboarded,
                Grade = user.Grade,
                TargetExams = user.TargetExams,
                SelfAssessmentLevel = user.SelfAssessmentLevel,
                StreakDays = user.StreakDays,
                DailyDeepQuestionsUsed = user.DailyDeepQuestionsUsed
            }
        });
    }
}

public class OnboardingRequest
{
    public int Grade { get; set; }
    public string TargetExams { get; set; } = string.Empty;
    public int SelfAssessmentLevel { get; set; }
}
