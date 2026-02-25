using System.Net.Http;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using SmartExamTrainer.Application.Interfaces.AI;

namespace SmartExamTrainer.Infrastructure.AI;

public class GeminiStreamingClient : IAIStreamingClient
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _model;

    public GeminiStreamingClient(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["Gemini:ApiKey"] ?? string.Empty;
        
        // Default to newest pro model if unspecified
        _model = configuration["Gemini:Model"] ?? "gemini-3.1-pro";
    }

    public async IAsyncEnumerable<string> StreamTextAsync(string prompt, string? imageBase64 = null, [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            throw new InvalidOperationException("Gemini API key is not configured. Please add \"Gemini:ApiKey\" to appsettings.json.");
        }

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:streamGenerateContent?alt=sse&key={_apiKey}";

        var parts = new List<object>
        {
            new { text = prompt }
        };

        if (!string.IsNullOrEmpty(imageBase64))
        {
            // Remove data header if it exists (e.g., data:image/png;base64,xxxx)
            var base64Data = imageBase64.Contains(",") ? imageBase64.Split(',')[1] : imageBase64;
            
            parts.Add(new
            {
                inlineData = new
                {
                    mimeType = "image/jpeg", // Send as jpeg, gemini will process accordingly
                    data = base64Data
                }
            });
        }

        var requestBody = new
        {
            contents = new[]
            {
                new { parts = parts }
            },
            generationConfig = new
            {
                temperature = 0.2 // Lowered temperature for structured math tasks
            }
        };

        var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
        using var request = new HttpRequestMessage(HttpMethod.Post, url) { Content = content };
        using var response = await _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        
        response.EnsureSuccessStatusCode();

        using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var reader = new StreamReader(stream);

        string? line;
        while ((line = await reader.ReadLineAsync(cancellationToken)) != null)
        {
            if (string.IsNullOrWhiteSpace(line)) continue;

            if (line.StartsWith("data: "))
            {
                var data = line.Substring(6);
                if (data == "[DONE]") break;

                using var doc = JsonDocument.Parse(data);
                
                // Traverse candidates[0].content.parts[0].text
                if (doc.RootElement.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
                {
                    var firstCandidate = candidates[0];
                    if (firstCandidate.TryGetProperty("content", out var cn) && 
                        cn.TryGetProperty("parts", out var partsElement) && 
                        partsElement.GetArrayLength() > 0)
                    {
                        var firstPart = partsElement[0];
                        if (firstPart.TryGetProperty("text", out var textElement))
                        {
                            var text = textElement.GetString();
                            if (!string.IsNullOrEmpty(text))
                            {
                                yield return text;
                            }
                        }
                    }
                }
            }
        }
    }
}
