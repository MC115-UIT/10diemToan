using SmartExamTrainer.Application.Interfaces.AI;
using System.Runtime.CompilerServices;

namespace SmartExamTrainer.Infrastructure.AI;

public class MockAIStreamingClient : IAIStreamingClient
{
    public async IAsyncEnumerable<string> StreamTextAsync(string prompt, string? imageBase64 = null, [EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        var mockJson = @"{
  ""interpretation"": {
    ""problem_summary"": ""Tính tích phân xác định."",
    ""given_data"": [""Hàm số cần lấy tích phân là (2x+1)^3"", ""Cận dưới là 0, cận trên là 1""],
    ""required_result"": ""Giá trị số của tích phân"",
    ""diagram_interpretation"": ""Không có hình vẽ trong đề bài"",
    ""assumptions"": """"
  },
  ""nature_analysis"": {
    ""main_topic"": ""Giải Tích 12"",
    ""sub_topic"": ""Tích phân xác định"",
    ""exam_context"": ""THPTQG - Câu hỏi tương tự đề 2019"",
    ""core_skill_tested"": ""Phương pháp đổi biến số hoặc khai triển đa thức"",
    ""difficulty_level"": {
      ""level"": 2,
      ""justification"": ""Có thể giải bằng nhiều cách, thời lượng tính toán ngắn.""
    },
    ""typical_time"": ""2-3 phút""
  },
  ""concept_foundation"": [
    {
      ""concept_name"": ""Phương pháp đổi biến số trong tích phân"",
      ""prerequisites"": ""Đạo hàm của hàm hợp, vi phân"",
      ""explanation"": ""Đặt t = 2x+1 để đưa tích phân về dạng cơ bản t^3."",
      ""common_misunderstanding"": ""Quên đổi cận khi đổi biến.""
    }
  ],
  ""solution_steps"": [
    {
      ""step"": 1,
      ""action"": ""Đặt t = 2x + 1"",
      ""reasoning"": ""Biểu thức bên trong lũy thừa là hàm bậc nhất, đặt ẩn phụ sẽ đơn giản hóa bài toán."",
      ""alternative_approach"": ""Khai triển trực tiếp (2x+1)^3 bằng hằng đẳng thức rồi nguyên hàm từng số hạng.""
    }
  ],
  ""final_answer"": ""10"",
  ""common_traps"": [
    {
      ""mistake"": ""Quên nhân với 1/2 khi tính dt"",
      ""why_students_make_it"": ""Tính dt = d(2x+1) = 2dx nhưng không chuyển dx = dt/2"",
      ""example_of_mistake"": ""Tính ra kết quả là 20 thay vì 10"",
      ""how_to_avoid"": ""Luôn viết cẩn thận dx theo dt.""
    }
  ],
  ""variants"": [
    {
      ""variant_type"": ""Thay đổi tham số"",
      ""difficulty"": 2,
      ""new_problem"": ""Tích phân từ 0 đến 2 của (3x+4)^3 dx"",
      ""what_it_tests"": ""Đổi biến với hệ số khác.""
    }
  ],
  ""key_takeaway"": ""Đối với hàm (ax+b)^n, luôn có thể dùng đổi biến t=ax+b, đừng quên đổi vi phân dx = dt/a và đổi cận."",
  ""error_note"": """"
}";

        // Simulate chunk streaming
        int chunkSize = 20;
        for (int i = 0; i < mockJson.Length; i += chunkSize)
        {
            await Task.Delay(50, cancellationToken); // Mock delay for token generation
            var length = Math.Min(chunkSize, mockJson.Length - i);
            yield return mockJson.Substring(i, length);
        }
    }
}
