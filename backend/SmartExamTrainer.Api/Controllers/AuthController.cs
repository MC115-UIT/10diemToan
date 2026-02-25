using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Mvc;
using SmartExamTrainer.Application.Interfaces.Auth;

namespace SmartExamTrainer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request.Email, request.Password, GetIpAddress());
        
        if (result.IsFailed)
        {
            return Unauthorized(new { errors = result.Errors.Select(e => e.Message) });
        }

        SetTokenCookie(result.Value.RefreshToken);

        return Ok(new { accessToken = result.Value.AccessToken, user = result.Value.User });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request.Email, request.Password, request.FullName, GetIpAddress());
        
        if (result.IsFailed)
        {
            return BadRequest(new { errors = result.Errors.Select(e => e.Message) });
        }

        SetTokenCookie(result.Value.RefreshToken);

        return Ok(new { accessToken = result.Value.AccessToken, user = result.Value.User });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("RefreshToken", new CookieOptions { 
            HttpOnly = true, 
            Secure = true, 
            SameSite = SameSiteMode.Strict 
        });
        return Ok(new { message = "Logged out successfully" });
    }

    [HttpPost("refresh-token")]
    [ValidateAntiForgeryToken] // Protect token refresh with CSRF
    public async Task<IActionResult> RefreshToken()
    {
        var refreshToken = Request.Cookies["RefreshToken"];
        
        if (string.IsNullOrEmpty(refreshToken))
        {
            return Unauthorized(new { message = "Refresh token is missing" });
        }

        var result = await _authService.RefreshTokenAsync(refreshToken, GetIpAddress());
        
        if (result.IsFailed)
        {
            return Unauthorized(new { errors = result.Errors.Select(e => e.Message) });
        }

        SetTokenCookie(result.Value.RefreshToken);

        return Ok(new { accessToken = result.Value.AccessToken, user = result.Value.User });
    }

    [HttpGet("csrf")]
    public IActionResult GetCsrfToken([FromServices] IAntiforgery antiforgery)
    {
        var tokens = antiforgery.GetAndStoreTokens(HttpContext);
        
        if (tokens.RequestToken == null) 
        {
             return StatusCode(500, "Failed to generate CSRF token.");
        }

        // Send the CSRF token in a non-HttpOnly cookie so the frontend can read it and send it in a header,
        // while Antiforgery validates the cookie pair on `ValidateAntiForgeryToken` endpoints.
        Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken, 
            new CookieOptions { HttpOnly = false, Secure = true, SameSite = SameSiteMode.Strict });

        return Ok(new { csrfToken = tokens.RequestToken });
    }



    private void SetTokenCookie(string token)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true, // Must be true if cross-site, usually true in production (HTTPS)
            SameSite = SameSiteMode.Strict, 
            Expires = DateTime.UtcNow.AddDays(7)
        };
        Response.Cookies.Append("RefreshToken", token, cookieOptions);
    }

    private string GetIpAddress()
    {
        if (Request.Headers.ContainsKey("X-Forwarded-For"))
            return Request.Headers["X-Forwarded-For"].ToString();
        return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "Unknown";
    }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
}
