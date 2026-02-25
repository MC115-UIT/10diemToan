using SmartExamTrainer.Domain.Common;

namespace SmartExamTrainer.Domain.Entities;

public class RefreshToken : BaseEntity
{
    public string Token { get; private set; }
    public DateTime Expires { get; private set; }
    public bool IsExpired => DateTime.UtcNow >= Expires;
    public DateTime Created { get; private set; }
    public string CreatedByIp { get; private set; }
    public DateTime? Revoked { get; private set; }
    public string? RevokedByIp { get; private set; }
    public string? ReplacedByToken { get; private set; }
    public string? ReasonRevoked { get; private set; }
    public bool IsActive => Revoked == null && !IsExpired;

    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;

    private RefreshToken() { } // ORM

    public RefreshToken(Guid userId, string token, DateTime expires, string createdByIp)
    {
        UserId = userId;
        Token = token;
        Expires = expires;
        Created = DateTime.UtcNow;
        CreatedByIp = createdByIp;
    }

    public void Revoke(string ipAddress, string reason, string? replacedByToken = null)
    {
        Revoked = DateTime.UtcNow;
        RevokedByIp = ipAddress;
        ReasonRevoked = reason;
        ReplacedByToken = replacedByToken;
    }
}
