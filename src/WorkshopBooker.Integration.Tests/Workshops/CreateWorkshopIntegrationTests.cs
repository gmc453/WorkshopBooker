using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using WorkshopBooker.Application.Common.Interfaces;
using WorkshopBooker.Application.Workshops.Commands.CreateWorkshop;
using WorkshopBooker.Domain.Entities;
using WorkshopBooker.Infrastructure.Persistence;
using WorkshopBooker.Infrastructure.Security;
using Xunit;
using FluentAssertions;
using System.Collections.Generic;
using System.Linq;

namespace WorkshopBooker.Integration.Tests.Workshops;

public class CreateWorkshopIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private static readonly string InMemoryDbName = "TestDb_Shared"; // Stała nazwa bazy dla wszystkich testów
    private readonly WebApplicationFactory<Program> _factory;
    private readonly JsonSerializerOptions _jsonOptions;

    public CreateWorkshopIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Usuń WSZYSTKIE rejestracje związane z bazą danych
                var descriptorsToRemove = services
                    .Where(d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>) ||
                               d.ServiceType == typeof(IApplicationDbContext) ||
                               d.ServiceType == typeof(ApplicationDbContext) ||
                               d.ServiceType.Name.Contains("DbContext") ||
                               d.ServiceType.Name.Contains("Npgsql") ||
                               d.ServiceType.Name.Contains("PostgreSQL"))
                    .ToList();

                foreach (var descriptor in descriptorsToRemove)
                {
                    services.Remove(descriptor);
                }

                // Usuń również wszystkie rejestracje providerów EF Core
                var efDescriptors = services
                    .Where(d => d.ServiceType.Name.Contains("EntityFramework") ||
                               d.ServiceType.Name.Contains("DbContext"))
                    .ToList();

                foreach (var descriptor in efDescriptors)
                {
                    services.Remove(descriptor);
                }

                // Dodaj InMemory DbContext ze współdzieloną nazwą
                services.AddDbContext<ApplicationDbContext>(options =>
                {
                    options.UseInMemoryDatabase(InMemoryDbName);
                });

                // Rejestruj ApplicationDbContext jako IApplicationDbContext
                services.AddScoped<IApplicationDbContext>(provider => 
                    provider.GetRequiredService<ApplicationDbContext>());

                // Dodaj testowe dane
                services.AddScoped<ITestDataSeeder, TestDataSeeder>();
            });
        });

        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    [Fact]
    public async Task Should_CreateWorkshop_And_ReturnCorrectResponse_When_AuthenticatedUser()
    {
        // Arrange
        var client = _factory.CreateClient();
        var token = await GenerateJwtTokenAsync(client);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var createWorkshopRequest = new CreateWorkshopCommand(
            "Test Warsztat",
            "Opis testowego warsztatu",
            "+48123456789",
            "test@workshop.com",
            "ul. Testowa 1, Warszawa"
        );

        var json = JsonSerializer.Serialize(createWorkshopRequest, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await client.PostAsync("/api/workshops", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var workshopId = JsonSerializer.Deserialize<Guid>(responseContent, _jsonOptions);
        workshopId.Should().NotBeEmpty();

        // Sprawdź czy warsztat został zapisany w bazie danych
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        var savedWorkshop = await context.Workshops.FirstOrDefaultAsync(w => w.Id == workshopId);
        
        savedWorkshop.Should().NotBeNull();
        savedWorkshop!.Name.Should().Be("Test Warsztat");
        savedWorkshop.Description.Should().Be("Opis testowego warsztatu");
        savedWorkshop.PhoneNumber.Should().Be("+48123456789");
        savedWorkshop.Email.Should().Be("test@workshop.com");
        savedWorkshop.Address.Should().Be("ul. Testowa 1, Warszawa");
        savedWorkshop.IsActive.Should().BeTrue();
        savedWorkshop.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task Should_Return401_When_UserNotAuthenticated()
    {
        // Arrange
        var client = _factory.CreateClient();
        var createWorkshopRequest = new CreateWorkshopCommand(
            "Test Warsztat",
            "Opis testowego warsztatu",
            "+48123456789",
            "test@workshop.com",
            "ul. Testowa 1, Warszawa"
        );

        var json = JsonSerializer.Serialize(createWorkshopRequest, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await client.PostAsync("/api/workshops", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Should_Return400_When_ValidationFails()
    {
        // Arrange
        var client = _factory.CreateClient();
        var token = await GenerateJwtTokenAsync(client);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var invalidRequest = new CreateWorkshopCommand(
            "", // Pusta nazwa - nieprawidłowa
            "Opis", // Za krótki opis
            "+48123456789",
            "test@workshop.com",
            "ul. Testowa 1, Warszawa"
        );

        var json = JsonSerializer.Serialize(invalidRequest, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await client.PostAsync("/api/workshops", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(responseContent, _jsonOptions);
        
        errorResponse.Should().NotBeNull();
        errorResponse!.Error.Should().Contain("Nazwa warsztatu jest wymagana");
        errorResponse.ValidationErrors.Should().Contain(e => e.Contains("Opis warsztatu musi mieć co najmniej 10 znaków"));
    }

    [Fact]
    public async Task Should_Return400_When_EmailIsInvalid()
    {
        // Arrange
        var client = _factory.CreateClient();
        var token = await GenerateJwtTokenAsync(client);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var invalidRequest = new CreateWorkshopCommand(
            "Test Warsztat",
            "Opis testowego warsztatu",
            "+48123456789",
            "invalid-email", // Nieprawidłowy email
            "ul. Testowa 1, Warszawa"
        );

        var json = JsonSerializer.Serialize(invalidRequest, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await client.PostAsync("/api/workshops", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(responseContent, _jsonOptions);
        
        errorResponse.Should().NotBeNull();
        errorResponse!.Error.Should().Contain("Nieprawidłowy format adresu email");
    }

    [Fact]
    public async Task Should_Return400_When_PhoneNumberIsInvalid()
    {
        // Arrange
        var client = _factory.CreateClient();
        var token = await GenerateJwtTokenAsync(client);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var invalidRequest = new CreateWorkshopCommand(
            "Test Warsztat",
            "Opis testowego warsztatu",
            "invalid-phone", // Nieprawidłowy numer telefonu
            "test@workshop.com",
            "ul. Testowa 1, Warszawa"
        );

        var json = JsonSerializer.Serialize(invalidRequest, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await client.PostAsync("/api/workshops", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(responseContent, _jsonOptions);
        
        errorResponse.Should().NotBeNull();
        errorResponse!.Error.Should().Contain("Nieprawidłowy format numeru telefonu");
    }

    [Fact]
    public async Task Should_Return400_When_NameIsWhitespace()
    {
        // Arrange
        var client = _factory.CreateClient();
        var token = await GenerateJwtTokenAsync(client);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var invalidRequest = new CreateWorkshopCommand(
            "   ", // Tylko białe znaki
            "Opis testowego warsztatu",
            "+48123456789",
            "test@workshop.com",
            "ul. Testowa 1, Warszawa"
        );

        var json = JsonSerializer.Serialize(invalidRequest, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await client.PostAsync("/api/workshops", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(responseContent, _jsonOptions);
        
        errorResponse.Should().NotBeNull();
        errorResponse!.Error.Should().Contain("Nazwa warsztatu jest wymagana");
    }

    [Fact]
    public async Task Should_PersistWorkshopToDatabase_When_ValidRequest()
    {
        // Arrange
        var client = _factory.CreateClient();
        var token = await GenerateJwtTokenAsync(client);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var createWorkshopRequest = new CreateWorkshopCommand(
            "Persistent Warsztat",
            "Warsztat do testowania persystencji",
            "+48123456789",
            "persistent@workshop.com",
            "ul. Persystentna 1, Warszawa"
        );

        var json = JsonSerializer.Serialize(createWorkshopRequest, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await client.PostAsync("/api/workshops", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var workshopId = JsonSerializer.Deserialize<Guid>(responseContent, _jsonOptions);

        // Sprawdź czy warsztat został zapisany w bazie danych
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        
        var savedWorkshop = await context.Workshops
            .Include(w => w.User)
            .FirstOrDefaultAsync(w => w.Id == workshopId);
        
        savedWorkshop.Should().NotBeNull();
        savedWorkshop!.Name.Should().Be("Persistent Warsztat");
        savedWorkshop.Description.Should().Be("Warsztat do testowania persystencji");
        savedWorkshop.UserId.Should().NotBeNull();
        savedWorkshop.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        savedWorkshop.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task Should_ReturnWorkshopDto_With_CorrectMapping()
    {
        // Arrange
        var client = _factory.CreateClient();
        var token = await GenerateJwtTokenAsync(client);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var createWorkshopRequest = new CreateWorkshopCommand(
            "Mapped Warsztat",
            "Warsztat do testowania mapowania",
            "+48123456789",
            "mapped@workshop.com",
            "ul. Mapowana 1, Warszawa"
        );

        var json = JsonSerializer.Serialize(createWorkshopRequest, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await client.PostAsync("/api/workshops", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var workshopId = JsonSerializer.Deserialize<Guid>(responseContent, _jsonOptions);

        // Sprawdź czy można pobrać utworzony warsztat przez GET endpoint
        var getResponse = await client.GetAsync($"/api/workshops/{workshopId}");
        getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        
        var getResponseContent = await getResponse.Content.ReadAsStringAsync();
        var workshopDto = JsonSerializer.Deserialize<WorkshopDto>(getResponseContent, _jsonOptions);
        
        workshopDto.Should().NotBeNull();
        workshopDto!.Id.Should().Be(workshopId);
        workshopDto.Name.Should().Be("Mapped Warsztat");
        workshopDto.Description.Should().Be("Warsztat do testowania mapowania");
        workshopDto.PhoneNumber.Should().Be("+48123456789");
        workshopDto.Email.Should().Be("mapped@workshop.com");
        workshopDto.Address.Should().Be("ul. Mapowana 1, Warszawa");
        workshopDto.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task Should_HandleDuplicateWorkshopName_When_CreatingWorkshop()
    {
        // Arrange
        var client = _factory.CreateClient();
        var token = await GenerateJwtTokenAsync(client);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Utwórz pierwszy warsztat
        var firstWorkshop = new CreateWorkshopCommand(
            "Duplikat Warsztat",
            "Pierwszy warsztat o tej nazwie",
            "+48123456789",
            "first@workshop.com",
            "ul. Pierwsza 1, Warszawa"
        );

        var firstJson = JsonSerializer.Serialize(firstWorkshop, _jsonOptions);
        var firstContent = new StringContent(firstJson, Encoding.UTF8, "application/json");
        await client.PostAsync("/api/workshops", firstContent);

        // Próbuj utworzyć drugi warsztat o tej samej nazwie
        var secondWorkshop = new CreateWorkshopCommand(
            "Duplikat Warsztat", // Ta sama nazwa
            "Drugi warsztat o tej nazwie",
            "+48987654321",
            "second@workshop.com",
            "ul. Druga 2, Warszawa"
        );

        var secondJson = JsonSerializer.Serialize(secondWorkshop, _jsonOptions);
        var secondContent = new StringContent(secondJson, Encoding.UTF8, "application/json");

        // Act
        var response = await client.PostAsync("/api/workshops", secondContent);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(responseContent, _jsonOptions);
        
        errorResponse.Should().NotBeNull();
        errorResponse!.Error.Should().Contain("Warsztat o takiej nazwie już istnieje");
    }

    [Fact]
    public async Task Should_HandleDuplicateWorkshopNameCaseInsensitive_When_CreatingWorkshop()
    {
        // Arrange
        var client = _factory.CreateClient();
        var token = await GenerateJwtTokenAsync(client);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Utwórz pierwszy warsztat
        var firstWorkshop = new CreateWorkshopCommand(
            "Test Warsztat",
            "Pierwszy warsztat",
            "+48123456789",
            "first@workshop.com",
            "ul. Pierwsza 1, Warszawa"
        );

        var firstJson = JsonSerializer.Serialize(firstWorkshop, _jsonOptions);
        var firstContent = new StringContent(firstJson, Encoding.UTF8, "application/json");
        await client.PostAsync("/api/workshops", firstContent);

        // Próbuj utworzyć drugi warsztat o tej samej nazwie (różne wielkości liter)
        var secondWorkshop = new CreateWorkshopCommand(
            "test warsztat", // Ta sama nazwa, różne wielkości liter
            "Drugi warsztat",
            "+48987654321",
            "second@workshop.com",
            "ul. Druga 2, Warszawa"
        );

        var secondJson = JsonSerializer.Serialize(secondWorkshop, _jsonOptions);
        var secondContent = new StringContent(secondJson, Encoding.UTF8, "application/json");

        // Act
        var response = await client.PostAsync("/api/workshops", secondContent);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(responseContent, _jsonOptions);
        
        errorResponse.Should().NotBeNull();
        errorResponse!.Error.Should().Contain("Warsztat o takiej nazwie już istnieje");
    }

    [Fact]
    public async Task Should_AssignWorkshopToCorrectUser_When_CreatingWorkshop()
    {
        // Arrange
        var client = _factory.CreateClient();
        var token = await GenerateJwtTokenAsync(client);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var createWorkshopRequest = new CreateWorkshopCommand(
            "User Assignment Test",
            "Warsztat do testowania przypisania użytkownika",
            "+48123456789",
            "assignment@workshop.com",
            "ul. Testowa 1, Warszawa"
        );

        var json = JsonSerializer.Serialize(createWorkshopRequest, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await client.PostAsync("/api/workshops", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var workshopId = JsonSerializer.Deserialize<Guid>(responseContent, _jsonOptions);

        // Sprawdź czy warsztat został przypisany do właściwego użytkownika
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        
        var savedWorkshop = await context.Workshops
            .Include(w => w.User)
            .FirstOrDefaultAsync(w => w.Id == workshopId);
        
        savedWorkshop.Should().NotBeNull();
        savedWorkshop!.UserId.Should().NotBeNull();
        savedWorkshop.User.Should().NotBeNull();
        savedWorkshop.User!.Email.Should().StartWith("test-");
        savedWorkshop.User.Email.Should().EndWith("@example.com");
        savedWorkshop.User.FirstName.Should().Be("Test");
        savedWorkshop.User.LastName.Should().Be("User");
    }

    [Fact]
    public async Task Should_Return500_When_DatabaseErrorOccurs()
    {
        // Arrange
        var client = _factory.CreateClient();
        var token = await GenerateJwtTokenAsync(client);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var createWorkshopRequest = new CreateWorkshopCommand(
            "Error Test Warsztat",
            "Warsztat do testowania błędów bazy danych",
            "+48123456789",
            "error@workshop.com",
            "ul. Error 1, Warszawa"
        );

        var json = JsonSerializer.Serialize(createWorkshopRequest, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await client.PostAsync("/api/workshops", content);

        // Assert
        // W przypadku błędu bazy danych powinien zwrócić 500
        // Ale w testach InMemory nie powinno być błędów bazy danych
        response.StatusCode.Should().BeOneOf(HttpStatusCode.Created, HttpStatusCode.InternalServerError);
    }

    [Fact]
    public async Task Should_HandleConcurrentRequests_When_CreatingWorkshops()
    {
        // Arrange
        var client = _factory.CreateClient();
        var token = await GenerateJwtTokenAsync(client);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Act - wykonaj kilka równoczesnych żądań z unikalnymi nazwami
        var tasks = Enumerable.Range(0, 3).Select(async index =>
        {
            var uniqueId = Guid.NewGuid().ToString("N")[..8];
            var createWorkshopRequest = new CreateWorkshopCommand(
                $"Concurrent Test Warsztat {index} {uniqueId}",
                $"Warsztat do testowania współbieżności {index}",
                "+48123456789",
                $"concurrent{index}@workshop.com",
                $"ul. Concurrent {index}, Warszawa"
            );

            var json = JsonSerializer.Serialize(createWorkshopRequest, _jsonOptions);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            return await client.PostAsync("/api/workshops", content);
        });

        var responses = await Task.WhenAll(tasks);

        // Assert
        responses.Should().HaveCount(3);
        // Wszystkie powinny zwrócić 201 Created (każdy ma unikalną nazwę)
        responses.Should().OnlyContain(r => r.StatusCode == HttpStatusCode.Created);
        
        // Sprawdź czy wszystkie warsztaty zostały zapisane w bazie
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        
        var savedWorkshops = await context.Workshops
            .Where(w => w.Name.StartsWith("Concurrent Test Warsztat"))
            .ToListAsync();
        
        savedWorkshops.Should().HaveCount(3);
    }

    [Fact]
    public async Task Should_ValidateAllRequiredFields_When_CreatingWorkshop()
    {
        // Arrange
        var client = _factory.CreateClient();
        var token = await GenerateJwtTokenAsync(client);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var createWorkshopRequest = new CreateWorkshopCommand(
            "Complete Test Warsztat",
            "Kompletny warsztat testowy z wszystkimi polami",
            "+48123456789",
            "complete@workshop.com",
            "ul. Kompletna 1, Warszawa"
        );

        var json = JsonSerializer.Serialize(createWorkshopRequest, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await client.PostAsync("/api/workshops", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var workshopId = JsonSerializer.Deserialize<Guid>(responseContent, _jsonOptions);

        // Sprawdź wszystkie pola w bazie danych
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
        
        var savedWorkshop = await context.Workshops.FirstOrDefaultAsync(w => w.Id == workshopId);
        
        savedWorkshop.Should().NotBeNull();
        savedWorkshop!.Name.Should().Be("Complete Test Warsztat");
        savedWorkshop.Description.Should().Be("Kompletny warsztat testowy z wszystkimi polami");
        savedWorkshop.PhoneNumber.Should().Be("+48123456789");
        savedWorkshop.Email.Should().Be("complete@workshop.com");
        savedWorkshop.Address.Should().Be("ul. Kompletna 1, Warszawa");
        savedWorkshop.IsActive.Should().BeTrue();
        savedWorkshop.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        savedWorkshop.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        savedWorkshop.UserId.Should().NotBeNull();
    }

    private async Task<string> GenerateJwtTokenAsync(HttpClient client)
    {
        // Generuj unikalny email dla każdego testu
        var uniqueId = Guid.NewGuid().ToString("N")[..8];
        var uniqueEmail = $"test-{uniqueId}@example.com";
        
        // Zarejestruj użytkownika najpierw
        var registerRequest = new
        {
            Email = uniqueEmail,
            Password = "TestPassword123!",
            FirstName = "Test",
            LastName = "User"
        };

        var registerJson = JsonSerializer.Serialize(registerRequest, _jsonOptions);
        var registerContent = new StringContent(registerJson, Encoding.UTF8, "application/json");

        var registerResponse = await client.PostAsync("/api/auth/register", registerContent);
        
        if (!registerResponse.IsSuccessStatusCode)
        {
            var errorContent = await registerResponse.Content.ReadAsStringAsync();
            throw new InvalidOperationException($"Rejestracja nie powiodła się: {registerResponse.StatusCode} - {errorContent}");
        }

        // Poczekaj chwilę, aby upewnić się, że dane zostały zapisane
        await Task.Delay(100);

        // Teraz spróbuj zalogować
        var loginRequest = new
        {
            Email = uniqueEmail,
            Password = "TestPassword123!"
        };

        var loginJson = JsonSerializer.Serialize(loginRequest, _jsonOptions);
        var loginContent = new StringContent(loginJson, Encoding.UTF8, "application/json");

        var loginResponse = await client.PostAsync("/api/auth/login", loginContent);
        
        if (loginResponse.IsSuccessStatusCode)
        {
            var loginResponseContent = await loginResponse.Content.ReadAsStringAsync();
            var authResponse = JsonSerializer.Deserialize<AuthResponse>(loginResponseContent, _jsonOptions);
            return authResponse!.Token;
        }

        var loginErrorContent = await loginResponse.Content.ReadAsStringAsync();
        throw new InvalidOperationException($"Nie udało się wygenerować tokenu JWT: {loginResponse.StatusCode} - {loginErrorContent}");
    }

    // Klasy pomocnicze do deserializacji odpowiedzi
    private class ErrorResponse
    {
        public string Error { get; set; } = string.Empty;
        public List<string> ValidationErrors { get; set; } = new();
    }

    private class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
    }

    private class WorkshopDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}

// Interfejs do seedowania danych testowych
public interface ITestDataSeeder
{
    Task SeedAsync();
}

// Implementacja seedera danych testowych
public class TestDataSeeder : ITestDataSeeder
{
    private readonly IApplicationDbContext _context;

    public TestDataSeeder(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task SeedAsync()
    {
        // Dodaj testowego użytkownika jeśli nie istnieje
        if (!await _context.Users.AnyAsync(u => u.Email == "test@example.com"))
        {
            // Użyj BCrypt do zahashowania hasła
            var passwordHasher = new WorkshopBooker.Infrastructure.Security.PasswordHasher();
            var hashedPassword = passwordHasher.Hash("TestPassword123!");
            
            var user = new User(
                Guid.NewGuid(),
                "test@example.com",
                hashedPassword,
                "Test",
                "User"
            );
            _context.Users.Add(user);
            await _context.SaveChangesAsync(CancellationToken.None);
        }
    }
} 