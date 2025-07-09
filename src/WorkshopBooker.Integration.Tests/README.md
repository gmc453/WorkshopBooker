# Testy Integracyjne WorkshopBooker

## Opis

Ten projekt zawiera testy integracyjne dla WorkshopBooker API, które testują kompletny przepływ tworzenia warsztatów od autentykacji po zapisanie w bazie danych.

## Technologie

- **Microsoft.AspNetCore.Mvc.Testing** - do testowania aplikacji ASP.NET Core
- **Microsoft.EntityFrameworkCore.InMemory** - baza danych w pamięci dla testów
- **xUnit** - framework testowy
- **FluentAssertions** - asercje
- **System.Text.Json** - serializacja JSON

## Struktura Testów

### CreateWorkshopIntegrationTests

Testy sprawdzają kompletny przepływ tworzenia warsztatów:

1. **Should_CreateWorkshop_And_ReturnCorrectResponse_When_AuthenticatedUser()**
   - Testuje pomyślne utworzenie warsztatu przez zalogowanego użytkownika
   - Sprawdza odpowiedź HTTP 201 Created
   - Weryfikuje zapisanie w bazie danych

2. **Should_Return401_When_UserNotAuthenticated()**
   - Testuje odrzucenie żądania bez autoryzacji
   - Sprawdza odpowiedź HTTP 401 Unauthorized

3. **Should_Return400_When_ValidationFails()**
   - Testuje walidację danych wejściowych
   - Sprawdza odpowiedź HTTP 400 Bad Request z błędami walidacji

4. **Should_PersistWorkshopToDatabase_When_ValidRequest()**
   - Testuje persystencję danych w bazie
   - Sprawdza relacje między encjami

5. **Should_ReturnWorkshopDto_With_CorrectMapping()**
   - Testuje mapowanie danych do DTO
   - Sprawdza poprawność zwracanych danych

6. **Should_HandleDuplicateWorkshopName_When_CreatingWorkshop()**
   - Testuje obsługę duplikatów nazw warsztatów
   - Sprawdza odpowiedź HTTP 400 z odpowiednim komunikatem

7. **Should_AssignWorkshopToCorrectUser_When_CreatingWorkshop()**
   - Testuje przypisanie warsztatu do właściwego użytkownika
   - Sprawdza relacje w bazie danych

## Konfiguracja

### WebApplicationFactory

Testy używają `WebApplicationFactory<Program>` do uruchamiania aplikacji w trybie testowym:

```csharp
public class CreateWorkshopIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    
    public CreateWorkshopIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Zastąp rzeczywistą bazę danych InMemory
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                services.AddDbContext<ApplicationDbContext>(options =>
                {
                    options.UseInMemoryDatabase("TestDb_" + Guid.NewGuid());
                });
            });
        });
    }
}
```

### Autentykacja

Testy automatycznie generują tokeny JWT dla testowych użytkowników:

```csharp
private async Task<string> GenerateJwtTokenAsync(HttpClient client)
{
    // Próbuje zalogować istniejącego użytkownika
    // Jeśli nie istnieje, rejestruje nowego
    // Zwraca token JWT
}
```

### Seeder Danych Testowych

```csharp
public class TestDataSeeder : ITestDataSeeder
{
    public async Task SeedAsync()
    {
        // Tworzy testowego użytkownika z zahashowanym hasłem
        var passwordHasher = new PasswordHasher();
        var hashedPassword = passwordHasher.Hash("TestPassword123!");
        
        var user = new User(Guid.NewGuid(), "test@example.com", hashedPassword, "Test", "User");
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
    }
}
```

## Uruchamianie Testów

### Z linii komend

```bash
# Uruchom wszystkie testy integracyjne
dotnet test src/WorkshopBooker.Integration.Tests/

# Uruchom konkretny test
dotnet test src/WorkshopBooker.Integration.Tests/ --filter "Should_CreateWorkshop_And_ReturnCorrectResponse_When_AuthenticatedUser"

# Uruchom z verbose output
dotnet test src/WorkshopBooker.Integration.Tests/ --verbosity normal
```

### Z Visual Studio

1. Otwórz rozwiązanie `WorkshopBooker.sln`
2. W Eksploratorze testów znajdź projekt `WorkshopBooker.Integration.Tests`
3. Kliknij prawym przyciskiem myszy na test i wybierz "Uruchom"

### Z Visual Studio Code

1. Otwórz terminal w katalogu głównym projektu
2. Uruchom: `dotnet test src/WorkshopBooker.Integration.Tests/`

## Wymagania

- .NET 8.0 SDK
- Dostęp do wszystkich projektów WorkshopBooker (Domain, Application, Infrastructure, Api)
- Wszystkie zależności NuGet muszą być zainstalowane

## Debugowanie

Aby debugować testy:

1. Ustaw breakpoint w teście
2. Uruchom test w trybie debug
3. Możesz również debugować kod aplikacji podczas wykonywania testów

## Dodawanie Nowych Testów

1. Utwórz nową klasę testową dziedziczącą po `IClassFixture<WebApplicationFactory<Program>>`
2. Użyj `_factory.CreateClient()` do utworzenia klienta HTTP
3. Wygeneruj token JWT dla autentykacji
4. Wykonaj żądania HTTP i sprawdź odpowiedzi
5. Weryfikuj stan bazy danych po operacjach

## Przykład Nowego Testu

```csharp
[Fact]
public async Task Should_UpdateWorkshop_When_ValidRequest()
{
    // Arrange
    var client = _factory.CreateClient();
    var token = await GenerateJwtTokenAsync(client);
    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

    // Utwórz warsztat
    var createResponse = await CreateWorkshopAsync(client);
    var workshopId = JsonSerializer.Deserialize<Guid>(await createResponse.Content.ReadAsStringAsync());

    // Act - zaktualizuj warsztat
    var updateRequest = new UpdateWorkshopCommand(workshopId, "Nowa nazwa", "Nowy opis", ...);
    var updateResponse = await client.PutAsync($"/api/workshops/{workshopId}", ...);

    // Assert
    updateResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);
}
```

## Uwagi

- Każdy test używa osobnej bazy danych InMemory
- Testy są izolowane i nie wpływają na siebie
- Tokeny JWT są generowane automatycznie dla każdego testu
- Wszystkie operacje bazodanowe są wykonywane w transakcjach testowych 