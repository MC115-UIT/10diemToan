using SmartExamTrainer.Domain.Common;

namespace SmartExamTrainer.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string FullName { get; private set; } = string.Empty;
    
    public string Role { get; private set; } = "student"; // student, teacher, admin
    public string AuthProvider { get; private set; } = "local"; // local, google
    public string? GoogleId { get; private set; }

    public bool IsPremium { get; private set; }
    public string? MasterKeyHash { get; private set; }

    // Phase 1 Onboarding & Streaks
    public bool IsOnboarded { get; private set; }
    public int Grade { get; private set; }
    public string TargetExams { get; private set; } = string.Empty;
    public int SelfAssessmentLevel { get; private set; }
    public int StreakDays { get; private set; }
    public int DailyDeepQuestionsUsed { get; private set; }
    public DateTime? LastQuestionDate { get; private set; }

    private User() { } // EF Core

    public User(string email, string passwordHash, string fullName, string authProvider = "local", string? googleId = null)
    {
        Email = email;
        PasswordHash = passwordHash;
        FullName = fullName;
        AuthProvider = authProvider;
        GoogleId = googleId;
        IsPremium = false;
    }

    public void UpgradeToPremium()
    {
        IsPremium = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void CompleteOnboarding(int grade, string targetExams, int level)
    {
        IsOnboarded = true;
        Grade = grade;
        TargetExams = targetExams;
        SelfAssessmentLevel = level;
        UpdatedAt = DateTime.UtcNow;
    }

    public void RecordQuestionUsage()
    {
        var today = DateTime.UtcNow.Date;
        
        if (LastQuestionDate?.Date == today.AddDays(-1))
        {
            StreakDays++; // Continuous streak
        }
        else if (LastQuestionDate?.Date != today)
        {
            StreakDays = 1; // Reset streak if missed a day
            DailyDeepQuestionsUsed = 0; // Reset daily limit
        }

        DailyDeepQuestionsUsed++;
        LastQuestionDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
}
