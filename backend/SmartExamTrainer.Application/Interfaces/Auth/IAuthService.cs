using FluentResults;

namespace SmartExamTrainer.Application.Interfaces.Auth;

public interface IAuthService
{
    Task<Result<AuthResultDto>> LoginAsync(string email, string password, string ipAddress, CancellationToken cancellationToken = default);
    Task<Result<AuthResultDto>> RegisterAsync(string email, string password, string fullName, string ipAddress, CancellationToken cancellationToken = default);
    Task<Result<AuthResultDto>> RefreshTokenAsync(string token, string ipAddress, CancellationToken cancellationToken = default);
    Task<Result<AuthResultDto>> GoogleLoginAsync(string googleIdToken, string ipAddress, CancellationToken cancellationToken = default);
}

public class AuthResultDto
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public UserDto User { get; set; } = new();
}

public class UserDto
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsPremium { get; set; }
}
