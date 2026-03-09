# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and restore dependencies
COPY ["SmartExamTrainer.sln", "./"]
COPY ["SmartExamTrainer.Api/SmartExamTrainer.Api.csproj", "SmartExamTrainer.Api/"]
COPY ["SmartExamTrainer.Application/SmartExamTrainer.Application.csproj", "SmartExamTrainer.Application/"]
COPY ["SmartExamTrainer.Domain/SmartExamTrainer.Domain.csproj", "SmartExamTrainer.Domain/"]
COPY ["SmartExamTrainer.Infrastructure/SmartExamTrainer.Infrastructure.csproj", "SmartExamTrainer.Infrastructure/"]
COPY ["SmartExamTrainer.Persistence/SmartExamTrainer.Persistence.csproj", "SmartExamTrainer.Persistence/"]
COPY ["SmartExamTrainer.Shared/SmartExamTrainer.Shared.csproj", "SmartExamTrainer.Shared/"]

RUN dotnet restore "SmartExamTrainer.sln"

# Copy full source code and build
COPY . .
WORKDIR "/src/SmartExamTrainer.Api"
RUN dotnet build "SmartExamTrainer.Api.csproj" -c Release -o /app/build

# Publish Stage
FROM build AS publish
RUN dotnet publish "SmartExamTrainer.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "SmartExamTrainer.Api.dll"]
