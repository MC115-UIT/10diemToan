using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartExamTrainer.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddUserOnboardingAndImage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DailyDeepQuestionsUsed",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Grade",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsOnboarded",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastQuestionDate",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SelfAssessmentLevel",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "StreakDays",
                table: "Users",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TargetExams",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ImageBase64",
                table: "MathRequests",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DailyDeepQuestionsUsed",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Grade",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsOnboarded",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LastQuestionDate",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SelfAssessmentLevel",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "StreakDays",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TargetExams",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ImageBase64",
                table: "MathRequests");
        }
    }
}
