using System.Text.Json.Serialization;

namespace SmartExamTrainer.Shared.Models;

public class MathAIResponseDto
{
    [JsonPropertyName("interpretation")]
    public InterpretationDto Interpretation { get; set; } = new();

    [JsonPropertyName("nature_analysis")]
    public NatureAnalysisDto NatureAnalysis { get; set; } = new();

    [JsonPropertyName("concept_foundation")]
    public List<ConceptFoundationDto> ConceptFoundations { get; set; } = new();

    [JsonPropertyName("solution_steps")]
    public List<SolutionStepDto> SolutionSteps { get; set; } = new();

    [JsonPropertyName("final_answer")]
    public string FinalAnswer { get; set; } = string.Empty;

    [JsonPropertyName("common_traps")]
    public List<CommonTrapDto> CommonTraps { get; set; } = new();

    [JsonPropertyName("variants")]
    public List<VariantDto> Variants { get; set; } = new();

    [JsonPropertyName("key_takeaway")]
    public string KeyTakeaway { get; set; } = string.Empty;

    [JsonPropertyName("error_note")]
    public string ErrorNote { get; set; } = string.Empty;
}

public class InterpretationDto
{
    [JsonPropertyName("problem_summary")]
    public string ProblemSummary { get; set; } = string.Empty;

    [JsonPropertyName("given_data")]
    public List<string> GivenData { get; set; } = new();

    [JsonPropertyName("required_result")]
    public string RequiredResult { get; set; } = string.Empty;

    [JsonPropertyName("diagram_interpretation")]
    public string DiagramInterpretation { get; set; } = string.Empty;

    [JsonPropertyName("assumptions")]
    public string Assumptions { get; set; } = string.Empty;
}

public class NatureAnalysisDto
{
    [JsonPropertyName("main_topic")]
    public string MainTopic { get; set; } = string.Empty;

    [JsonPropertyName("sub_topic")]
    public string SubTopic { get; set; } = string.Empty;

    [JsonPropertyName("exam_context")]
    public string ExamContext { get; set; } = string.Empty;

    [JsonPropertyName("core_skill_tested")]
    public string CoreSkillTested { get; set; } = string.Empty;

    [JsonPropertyName("difficulty_level")]
    public DifficultyLevelDto DifficultyLevel { get; set; } = new();

    [JsonPropertyName("typical_time")]
    public string TypicalTime { get; set; } = string.Empty;
}

public class DifficultyLevelDto
{
    [JsonPropertyName("level")]
    public int Level { get; set; }

    [JsonPropertyName("justification")]
    public string Justification { get; set; } = string.Empty;
}

public class ConceptFoundationDto
{
    [JsonPropertyName("concept_name")]
    public string ConceptName { get; set; } = string.Empty;

    [JsonPropertyName("prerequisites")]
    public string Prerequisites { get; set; } = string.Empty;

    [JsonPropertyName("explanation")]
    public string Explanation { get; set; } = string.Empty;

    [JsonPropertyName("common_misunderstanding")]
    public string CommonMisunderstanding { get; set; } = string.Empty;
}

public class SolutionStepDto
{
    [JsonPropertyName("step")]
    public int Step { get; set; }

    [JsonPropertyName("action")]
    public string Action { get; set; } = string.Empty;

    [JsonPropertyName("reasoning")]
    public string Reasoning { get; set; } = string.Empty;

    [JsonPropertyName("alternative_approach")]
    public string AlternativeApproach { get; set; } = string.Empty;
}

public class CommonTrapDto
{
    [JsonPropertyName("mistake")]
    public string Mistake { get; set; } = string.Empty;

    [JsonPropertyName("why_students_make_it")]
    public string WhyStudentsMakeIt { get; set; } = string.Empty;

    [JsonPropertyName("example_of_mistake")]
    public string ExampleOfMistake { get; set; } = string.Empty;

    [JsonPropertyName("how_to_avoid")]
    public string HowToAvoid { get; set; } = string.Empty;
}

public class VariantDto
{
    [JsonPropertyName("variant_type")]
    public string VariantType { get; set; } = string.Empty;

    [JsonPropertyName("difficulty")]
    public int Difficulty { get; set; }

    [JsonPropertyName("new_problem")]
    public string NewProblem { get; set; } = string.Empty;

    [JsonPropertyName("what_it_tests")]
    public string WhatItTests { get; set; } = string.Empty;
}
