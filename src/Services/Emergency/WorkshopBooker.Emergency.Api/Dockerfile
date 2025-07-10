# build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY WorkshopBooker.Emergency.Api/WorkshopBooker.Emergency.Api.csproj WorkshopBooker.Emergency.Api/
COPY ../WorkshopBooker.Emergency.Domain/WorkshopBooker.Emergency.Domain.csproj ../WorkshopBooker.Emergency.Domain/
COPY ../WorkshopBooker.Emergency.Infrastructure/WorkshopBooker.Emergency.Infrastructure.csproj ../WorkshopBooker.Emergency.Infrastructure/
RUN dotnet restore WorkshopBooker.Emergency.Api/WorkshopBooker.Emergency.Api.csproj
COPY . .
WORKDIR /src/WorkshopBooker.Emergency.Api
RUN dotnet publish -c Release -o /app/publish

# runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "WorkshopBooker.Emergency.Api.dll"]
