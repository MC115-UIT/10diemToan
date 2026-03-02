using System.Text.RegularExpressions;

namespace SmartExamTrainer.Api.Extensions;

public static class EnvMappingConfigurationExtensions
{
    public static void LoadEnvFiles(this WebApplicationBuilder builder)
    {
        var root = Directory.GetCurrentDirectory();
        
        // Load default .env
        LoadEnvFile(Path.Combine(root, ".env"));
        
        // Load environment specific .env
        var envName = builder.Environment.EnvironmentName;
        LoadEnvFile(Path.Combine(root, $".env.{envName.ToLower()}"));
        LoadEnvFile(Path.Combine(root, $".env.{envName}"));
    }

    private static void LoadEnvFile(string filePath)
    {
        if (!File.Exists(filePath)) return;

        foreach (var line in File.ReadAllLines(filePath))
        {
            var trimmedLine = line.Trim();
            if (string.IsNullOrWhiteSpace(trimmedLine) || trimmedLine.StartsWith("#"))
                continue;

            // Handle key=value structure
            var parts = trimmedLine.Split('=', 2);
            if (parts.Length != 2)
                continue;

            var key = parts[0].Trim();
            var value = parts[1].Trim();
            
            // Remove optional surrounding quotes
            if (value.StartsWith("\"") && value.EndsWith("\""))
            {
                value = value.Substring(1, value.Length - 2);
            }
            else if (value.StartsWith("'") && value.EndsWith("'"))
            {
                value = value.Substring(1, value.Length - 2);
            }

            Environment.SetEnvironmentVariable(key, value);
        }
    }

    public static IConfigurationBuilder AddEnvPlaceholderMapping(this IConfigurationBuilder builder)
    {
        return builder.Add(new EnvPlaceholderConfigurationSource());
    }
}

public class EnvPlaceholderConfigurationSource : IConfigurationSource
{
    public IConfigurationProvider Build(IConfigurationBuilder builder)
    {
        // Build the current configuration to resolve placeholders against it
        return new EnvPlaceholderConfigurationProvider(builder.Build());
    }
}

public class EnvPlaceholderConfigurationProvider : ConfigurationProvider
{
    private readonly IConfigurationRoot _configuration;
    private static readonly Regex EnvVariableRegex = new Regex(@"\{([^}]+)\}", RegexOptions.Compiled);

    public EnvPlaceholderConfigurationProvider(IConfigurationRoot configuration)
    {
        _configuration = configuration;
    }

    public override void Load()
    {
        // Read all configuration values from the existing configuration
        foreach (var kvp in _configuration.AsEnumerable())
        {
            if (kvp.Value == null) continue;

            if (EnvVariableRegex.IsMatch(kvp.Value))
            {
                // Replace all {VAR_NAME} placeholders with the environment variable value
                var newValue = EnvVariableRegex.Replace(kvp.Value, match =>
                {
                    var envKey = match.Groups[1].Value;
                    var envValue = Environment.GetEnvironmentVariable(envKey);
                    return envValue ?? match.Value; // Leave the placeholder if no mapping found
                });

                Data[kvp.Key] = newValue;
            }
        }
    }
}
