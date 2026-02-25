using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using FluentResults;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SmartExamTrainer.Application.Interfaces.Auth;
using SmartExamTrainer.Application.Interfaces.Repositories;
using SmartExamTrainer.Domain.Entities;

namespace SmartExamTrainer.Infrastructure.Auth;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;

    public AuthService(
        IUserRepository userRepository, 
        IRefreshTokenRepository refreshTokenRepository,
        IUnitOfWork unitOfWork, 
        IConfiguration configuration)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _unitOfWork = unitOfWork;
        _configuration = configuration;
    }

    public async Task<Result<AuthResultDto>> LoginAsync(string email, string password, string ipAddress, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (user == null || !VerifyPasswordHash(password, user.PasswordHash))
        {
            return Result.Fail("Invalid email or password.");
        }

        var token = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken(ipAddress, user.Id);
        
        await _refreshTokenRepository.AddAsync(refreshToken, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Ok(new AuthResultDto
        {
            AccessToken = token,
            RefreshToken = refreshToken.Token,
            User = new UserDto { Id = user.Id, Email = user.Email, FullName = user.FullName, Role = user.Role, IsPremium = user.IsPremium }
        });
    }

    public async Task<Result<AuthResultDto>> RegisterAsync(string email, string password, string fullName, string ipAddress, CancellationToken cancellationToken = default)
    {
        var existingUser = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (existingUser != null)
        {
            return Result.Fail("User with this email already exists.");
        }

        var passwordHash = CreatePasswordHash(password);
        var user = new User(email, passwordHash, fullName);

        await _userRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var token = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken(ipAddress, user.Id);

        await _refreshTokenRepository.AddAsync(refreshToken, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Ok(new AuthResultDto
        {
            AccessToken = token,
            RefreshToken = refreshToken.Token,
            User = new UserDto { Id = user.Id, Email = user.Email, FullName = user.FullName, Role = user.Role, IsPremium = user.IsPremium }
        });
    }

    public async Task<Result<AuthResultDto>> RefreshTokenAsync(string token, string ipAddress, CancellationToken cancellationToken = default)
    {
        var refreshToken = await _refreshTokenRepository.GetByTokenAsync(token, cancellationToken);

        if (refreshToken == null || !refreshToken.IsActive)
        {
            return Result.Fail("Invalid or expired refresh token.");
        }

        var user = refreshToken.User;

        // Revoke the old refresh token (rotate)
        var newRefreshToken = GenerateRefreshToken(ipAddress, user.Id);
        refreshToken.Revoke(ipAddress, "Replaced by new token", newRefreshToken.Token);
        
        await _refreshTokenRepository.UpdateAsync(refreshToken, cancellationToken);
        await _refreshTokenRepository.AddAsync(newRefreshToken, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var jwtToken = GenerateJwtToken(user);

        return Result.Ok(new AuthResultDto
        {
            AccessToken = jwtToken,
            RefreshToken = newRefreshToken.Token,
            User = new UserDto { Id = user.Id, Email = user.Email, FullName = user.FullName, Role = user.Role, IsPremium = user.IsPremium }
        });
    }

    public Task<Result<AuthResultDto>> GoogleLoginAsync(string googleIdToken, string ipAddress, CancellationToken cancellationToken = default)
    {
        // TODO: Validate GoogleIDToken via Google Auth .NET package
        // If valid, either login existing user or create a new user with AuthProvider = 'google'
        return Task.FromResult(Result.Fail<AuthResultDto>("Google Login Not Fully Implemented Yet."));
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var secretKey = jwtSettings["Secret"] ?? "super-secret-key-that-should-be-very-long-and-secure-in-production-123!!";
        
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("IsPremium", user.IsPremium.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(2),
            SigningCredentials = creds,
            Issuer = jwtSettings["Issuer"] ?? "SmartExamTrainerApi",
            Audience = jwtSettings["Audience"] ?? "SmartExamTrainerClient"
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }

    private RefreshToken GenerateRefreshToken(string ipAddress, Guid userId)
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        var tokenString = Convert.ToBase64String(randomBytes);
        
        return new RefreshToken(userId, tokenString, DateTime.UtcNow.AddDays(7), ipAddress);
    }

    private string CreatePasswordHash(string password)
    {
        // Basic implementation, consider BCrypt.Net in real production
        using var hmac = new HMACSHA512();
        var salt = hmac.Key;
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(salt) + ":" + Convert.ToBase64String(hash);
    }

    private bool VerifyPasswordHash(string password, string storedHashInfo)
    {
        // Parsing "salt:hash"
        var parts = storedHashInfo.Split(':');
        if (parts.Length != 2) return false;

        var salt = Convert.FromBase64String(parts[0]);
        var storedHash = Convert.FromBase64String(parts[1]);

        using var hmac = new HMACSHA512(salt);
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));

        return computedHash.SequenceEqual(storedHash);
    }
}
